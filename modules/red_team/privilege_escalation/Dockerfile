FROM ubuntu:22.04

# Install SSH and tools
RUN apt-get update && \
    apt-get install -y openssh-server sudo vim && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configure SSH
RUN mkdir /var/run/sshd && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

COPY setup.sh /setup.sh
RUN chmod +x /setup.sh && bash /setup.sh

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
