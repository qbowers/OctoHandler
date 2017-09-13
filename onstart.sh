#!/bin/bash

parse_yaml() {
   local prefix=$2
   local s='[[:space:]]*' w='[a-zA-Z0-9_]*' fs=$(echo @|tr @ '\034')
   sed -ne "s|^\($s\)\($w\)$s:$s\"\(.*\)\"$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p"  $1 |
   awk -F$fs '{
      indent = length($1)/2;
      vname[indent] = $2;
      for (i in vname) {if (i > indent) {delete vname[i]}}
      if (length($3) > 0) {
         vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
         printf("%s%s%s=\"%s\"\n", "'$prefix'",vn, $2, $3);
      }
   }'
}
eval $(parse_yaml config.yaml "config_")



echo "OctoStart has been run" >> log.txt


echo "starting for $config_OctoPrint"
END=$config_OctoPrint
#for ((i=1; i<=$END; i++))
#for i in {1..$config_OctoPrint}
#	do
#		#echo "nonsense"
#		#su octoprint$i -c "python /home/octoprint$i/OctoPrint/run serve --port=500$i" >> log.txt &
#		echo "octoprint $i"		
#		#echo "octoprint $i started"
#	done

su octoprint1 -c "python /home/octoprint1/OctoPrint/run serve --port=5001" >> log.txt &
su octoprint2 -c "python /home/octoprint2/OctoPrint/run serve --port=5002" >> log.txt &
su octoprint3 -c "python /home/octoprint3/OctoPrint/run serve --port=5003" >> log.txt &
su octoprint4 -c "python /home/octoprint4/OctoPrint/run serve --port=5004" >> log.txt &
su octoprint5 -c "python /home/octoprint5/OctoPrint/run serve --port=5005" >> log.txt &
su octoprint6 -c "python /home/octoprint6/OctoPrint/run serve --port=5006" >> log.txt &
su octoprint7 -c "python /home/octoprint7/OctoPrint/run serve --port=5007" >> log.txt &
su octoprint8 -c "python /home/octoprint8/OctoPrint/run serve --port=5008" >> log.txt &

node server.js 2>> log.txt

echo "OctoStart has finished" >> log.txt
