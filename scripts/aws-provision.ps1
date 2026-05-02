$env:AWS_PAGER = ""
$aws = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

Write-Host "Creating Security Group..."
$sgId = &$aws ec2 create-security-group --group-name shopsphere-sg --description "Security group for ShopSphere" --query 'GroupId' --output text

Write-Host "Adding Ingress Rules to Security Group..."
&$aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0
&$aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0
&$aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 8089 --cidr 0.0.0.0/0

Write-Host "Creating Key Pair..."
$keyName = "shopsphere-key"
&$aws ec2 create-key-pair --key-name $keyName --query 'KeyMaterial' --output text > $keyName.pem
# Change permissions of key pair (not strictly required on Windows for SSH to AWS, but good practice)
icacls.exe $keyName.pem /inheritance:r
icacls.exe $keyName.pem /grant:r "$($env:USERNAME):(R)"

Write-Host "Finding Latest Ubuntu AMI..."
$amiId = &$aws ec2 describe-images --owners 099720109477 --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" --query 'sort_by(Images, &CreationDate)[-1].ImageId' --output text

Write-Host "Launching EC2 Instance..."
$instanceId = &$aws ec2 run-instances --image-id $amiId --count 1 --instance-type t3.large --key-name $keyName --security-group-ids $sgId --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' --query 'Instances[0].InstanceId' --output text

Write-Host "Waiting for instance to be running..."
&$aws ec2 wait instance-running --instance-ids $instanceId

Write-Host "Allocating Elastic IP (Static IP)..."
$allocationId = &$aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text

Write-Host "Associating Elastic IP with instance..."
$assocId = &$aws ec2 associate-address --instance-id $instanceId --allocation-id $allocationId --output text

$publicIp = &$aws ec2 describe-addresses --allocation-ids $allocationId --query 'Addresses[0].PublicIp' --output text

Write-Host "EC2 Instance is running with Elastic IP!"
Write-Host "Static Public IP: $publicIp"
Write-Host "Instance ID: $instanceId"

# Save Public IP to a file so deployment script can use it
$publicIp | Out-File "ec2_public_ip.txt"
