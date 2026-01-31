# We'll use Ubuntu 22.04 as your base as requested
FROM ubuntu:22.04

# 1. Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# 2. Install System Dependencies, Node.js, and Build Tools
# We need python3/make/g++ for the terminal library (node-pty)
RUN apt-get update && \
    apt-get install -y \
    curl \
    gnupg \
    build-essential \
    python3 \
    make \
    g++ \
    openssh-server \
    sudo && \
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    # Cleanup
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 3. Configure SSH (Your original logic)
RUN mkdir /var/run/sshd && \
    echo 'root:rootpassword' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# 4. Run your custom setup script (for the ctfuser and flag)
COPY setup.sh /setup.sh
RUN chmod +x /setup.sh && bash /setup.sh

# 5. Setup the Node.js Web Interface
WORKDIR /app

# Copy package files and install dependencies
# This is where the 'node-pty' will be compiled using the build tools above
COPY package.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# 6. Expose ports (3000 for Web UI, 22 for SSH)
EXPOSE 3000 22

# 7. Start both SSH and the Web Terminal
# We use 'service ssh start' to run SSH in background, then 'node server.js' as the main process
CMD service ssh start && node server.js