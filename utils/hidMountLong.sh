#!/bin/bash
sudo modprobe g_mass_storage file=/media.bin nofua=1 luns=1 ro=0 stall=0 removable=1 cdrom=0 idVendor=0x0781 idProduct=0x556e bcdDevice=0x0103 iManufacturer=Autr iProduct=DSK iSerialNumber=990431108215FFF05368
