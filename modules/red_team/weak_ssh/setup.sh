#!/bin/bash

# Create vulnerable user
useradd -m -s /bin/bash ctfuser
echo "ctfuser:password123" | chpasswd

# Get dynamic flag from environment or use default
FLAG="${FLAG_WEAK_SSH:-FLAG{WEAK_SSH_CREDS}}"

# Create root flag
echo "$FLAG" > /root/flag.txt
chmod 600 /root/flag.txt

# Create user hint
echo "Welcome to CyberForge SSH Lab!" > /home/ctfuser/welcome.txt
echo "Your mission: Find the flag in /root/flag.txt" >> /home/ctfuser/welcome.txt
echo "Hint: The password is weak..." >> /home/ctfuser/welcome.txt

# Start SSH service
service ssh start

echo "SSH Lab initialized successfully"
