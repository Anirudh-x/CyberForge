FROM ubuntu:22.04

# Install SSH server and dependencies
RUN apt-get update && \
    apt-get install -y openssh-server sudo && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configure SSH
RUN mkdir /var/run/sshd && \
    echo 'root:rootpassword' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

COPY setup.sh /setup.sh
RUN chmod +x /setup.sh && bash /setup.sh

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
