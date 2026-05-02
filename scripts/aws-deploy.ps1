$publicIp = Get-Content "ec2_public_ip.txt" | Out-String | ForEach-Object { $_.Trim() }

Write-Host "Zipping project..."
# Exclude node_modules, target folders, and other large unnecessary files
$excludeList = @("*\node_modules\*", "*\target\*", "*\.git\*", "*\.metadata\*", "*\.sonarlint\*")
Compress-Archive -Path ".\*" -DestinationPath "shopsphere.zip" -Force

Write-Host "Transferring files to EC2 ($publicIp)..."
# We add StrictHostKeyChecking=no so it doesn't prompt for confirmation on first connection
scp -o StrictHostKeyChecking=no -i "shopsphere-key.pem" "shopsphere.zip" ubuntu@${publicIp}:~

Write-Host "Connecting via SSH to install Docker and run the app..."
ssh -o StrictHostKeyChecking=no -i "shopsphere-key.pem" ubuntu@${publicIp} "
  sudo apt-get update -y
  sudo apt-get install docker.io docker-compose unzip -y
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker ubuntu
  
  unzip -o shopsphere.zip -d shopsphere
  cd shopsphere
  
  export EC2_PUBLIC_IP=$publicIp
  sudo EC2_PUBLIC_IP=$publicIp docker-compose up -d --build
"

Write-Host "Deployment initiated successfully!"
Write-Host "You can access your site at: http://$publicIp"
