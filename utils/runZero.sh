#!/bin/bash

# 1) use .bashrc to launch with autologin
# 2) edit /boot/dietpi/postboot to hide extra output

# clear console one page
printf "\033c" 

# set console colour to black
tput setaf 0 

# navigate to zero app
cd /home/dietpi/dsk/zero 

# run with log to txt

node index.js /mnt/media > /mnt/media/.bin/log.txt

