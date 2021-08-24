#!/bin/bash

# DIETPI ONLY
# /var/lib/dietpi/dietpi-autostart/custom.sh

# printf "\033c" # clear console
# tput setaf 0 # set console colour to black
cd /home/dietpi/dsk/zero # nav to zero location
node index.js /mnt/media > /mnt/media/.bin/log.txt # output to log file