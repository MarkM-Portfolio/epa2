#!/bin/bash

# FOR UBUNTU 22.04

echo -e "\nChange Timezone to PST..."
rm -rf /etc/localtime
ln -s /usr/share/zoneinfo/Asia/Manila /etc/localtime

set_domain() {
    echo -e "\nEnter Domain Name: "
    read DOMAIN
    echo -e ""
    ping -c 1 ${DOMAIN} &> /dev/null

    if [[ $? -ne 0 ]]; then
        echo -e "\nDomain ${DOMAIN} does not exists..."
        echo -e "\nPlease try Again.."
        set_domain
    else 
        DOMAIN=${DOMAIN}
        export DOMAIN=${DOMAIN}
        # sed -i "s/^DOMAIN=.*$/DOMAIN=${DOMAIN}/" /etc/environment
        echo "DOMAIN=${DOMAIN}" >> /etc/environment
        echo -e "\nDomain "${DOMAIN}" <environment variable set>..."
        install_packages
    fi  
}

install_packages() {
    echo -e "\nUpdating Packages..."
    apt -y update
    echo -e "\nDownloading Dependencies..."
    apt -y install apache2 apt-transport-https ca-certificates curl software-properties-common jq
    apt-get -y install postfix

    echo -e "\nInstalling Apache..."
    a2enmod proxy proxy_http
    ufw app list
    ufw allow 'Apache Full'
    ufw status
    echo "export DOMAIN=${DOMAIN}" >> /etc/apache2/envvars
    cp ./apache2-config.conf /etc/apache2/sites-available/${DOMAIN}.conf
    cd /etc/apache2/sites-available && a2ensite ${DOMAIN}.conf
    echo "ServerName 127.0.0.1" >> /etc/apache2/apache2.conf
    apache2ctl configtest
    systemctl enable apache2
    systemctl start apache2

    echo -e "\nInstalling Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt -y update
    apt-cache policy docker-ce
    apt -y install docker-ce docker-compose
    systemctl status docker
    echo -e "\nEnable Docker to user ${USER}..."
    usermod -aG docker ${USER}

    echo -e "\nUser logged out. Please re-login !!!"
    logout
}

set_domain
