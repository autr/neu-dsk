#!/bin/bash
sleep 5
sudo modprobe g_mass_storage file=/media.bin stall=0 remove=1 ro=0
