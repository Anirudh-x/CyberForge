#!/bin/bash

# Create vulnerable user
useradd -m -s /bin/bash lowpriv
echo "lowpriv:lowpriv" | chpasswd

# Make bash SUID (privilege escalation vector)
cp /bin/bash /tmp/bash_suid
chmod +s /tmp/bash_suid

# Create flag
echo "FLAG{PRIVILEGE_ESCALATION}" > /root/flag.txt
chmod 600 /root/flag.txt

# Create hint file
cat > /home/lowpriv/hint.txt << 'EOF'
Welcome to Privilege Escalation Lab!

You are user 'lowpriv'. Your goal is to read /root/flag.txt

Hint: Look for SUID binaries
Command: find / -perm -4000 2>/dev/null

Once you find a SUID bash, run: /path/to/bash -p
EOF

chown lowpriv:lowpriv /home/lowpriv/hint.txt

echo "Privilege Escalation Lab initialized"
