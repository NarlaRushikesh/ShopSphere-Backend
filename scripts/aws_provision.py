import boto3
import time
import os

def main():
    print("Initializing AWS EC2 Client...")
    ec2 = boto3.client('ec2', region_name='ap-south-1')
    ec2_resource = boto3.resource('ec2', region_name='ap-south-1')

    # 1. Create Security Group
    print("Creating Security Group...")
    sg_name = 'shopsphere-sg'
    
    # Check if SG exists
    try:
        response = ec2.describe_security_groups(GroupNames=[sg_name])
        sg_id = response['SecurityGroups'][0]['GroupId']
        print(f"Security Group {sg_name} already exists with ID: {sg_id}")
    except Exception as e:
        response = ec2.create_security_group(GroupName=sg_name, Description='Security group for ShopSphere')
        sg_id = response['GroupId']
        print(f"Created Security Group {sg_id}")
        
        # Add Ingress Rules
        ec2.authorize_security_group_ingress(
            GroupId=sg_id,
            IpPermissions=[
                {'IpProtocol': 'tcp', 'FromPort': 22, 'ToPort': 22, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
                {'IpProtocol': 'tcp', 'FromPort': 80, 'ToPort': 80, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
                {'IpProtocol': 'tcp', 'FromPort': 8089, 'ToPort': 8089, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
            ]
        )

    # 2. Create Key Pair
    print("Creating Key Pair...")
    key_name = 'shopsphere-key'
    try:
        response = ec2.create_key_pair(KeyName=key_name)
        with open(f'{key_name}.pem', 'w') as f:
            f.write(response['KeyMaterial'])
        print(f"Created Key Pair and saved to {key_name}.pem")
    except Exception as e:
        print(f"Key pair {key_name} already exists. Make sure you have the .pem file locally.")

    # 3. Find latest Ubuntu 22.04 AMI
    print("Finding Latest Ubuntu AMI...")
    response = ec2.describe_images(
        Owners=['099720109477'],
        Filters=[
            {'Name': 'name', 'Values': ['ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*']},
            {'Name': 'state', 'Values': ['available']}
        ]
    )
    images = sorted(response['Images'], key=lambda k: k['CreationDate'], reverse=True)
    ami_id = images[0]['ImageId']
    print(f"Selected AMI: {ami_id}")

    # 4. Launch EC2 Instance
    print("Launching EC2 Instance...")
    instances = ec2_resource.create_instances(
        ImageId=ami_id,
        MinCount=1,
        MaxCount=1,
        InstanceType='m7i-flex.large',
        UserData='''#!/bin/bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
''',
        KeyName=key_name,
        SecurityGroupIds=[sg_id],
        BlockDeviceMappings=[{
            'DeviceName': '/dev/sda1',
            'Ebs': {'VolumeSize': 30, 'VolumeType': 'gp3'}
        }]
    )
    instance = instances[0]
    print(f"Created Instance: {instance.id}")

    print("Waiting for instance to be running...")
    instance.wait_until_running()
    instance.load()
    
    print("Allocating Elastic IP...")
    allocation = ec2.allocate_address(Domain='vpc')
    allocation_id = allocation['AllocationId']
    eip = allocation['PublicIp']

    print("Associating Elastic IP...")
    ec2.associate_address(InstanceId=instance.id, AllocationId=allocation_id)

    print(f"EC2 Instance is running with Elastic IP!")
    print(f"Static Public IP: {eip}")
    print(f"Instance ID: {instance.id}")

    with open('ec2_public_ip.txt', 'w') as f:
        f.write(eip)

if __name__ == '__main__':
    main()
