# a) use with sudo
# b) use /var/lib/dietpi/dietpi-autostart/custom.sh with dietpi
# c) \033c clears console
# d) tput set console colour to black

printf "\033c" 
tput setaf 0
cd /home/dietpi/dsk/zero
node index.js /home/dietpi/dsk/samples > /home/dietpi/dsk/samples/bin/log.txt # output to log file