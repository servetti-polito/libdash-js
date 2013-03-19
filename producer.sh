#!/bin/bash

OUTDIR="./output/"

ROOT="/srv/ftp/dash/dataset/mmsys12/"
EXT="m4s"

SETS[0]="BigBuckBunny/bunny_2s/bunny_2s_100kbit"
SETS[1]="ElephantsDream/ed_2s/ed_2sec_100kbit"

NAMES[0]="bunny_2s"
NAMES[1]="ed_2sec"

INITSEG[0]="bunny_100kbit_dash.mp4"
INITSEG[1]="ed_1080p24_100kbit_dash.mp4"

MATCH="_AVAILABILITYSTARTTIME_"

while true ; do

for n in 0 1 ; do

DIR=${SETS[$n]}

rm ${OUTDIR} -rf
mkdir ${OUTDIR}
echo > ./${OUTDIR}/livestream.json

START=`date -u --rfc-3339=seconds|tr " " "T"| cut -c 1-19`
sed -e "s/_AVAILABILITYSTARTTIME_/${START}/g" < ${NAMES[$n]}.template.mpd > ./${OUTDIR}/${NAMES[$n]}.mpd
ln -sf ${ROOT}/${DIR}/${INITSEG[$n]} ./${OUTDIR}
CNT=1
TOT=`ls -1 ${ROOT}/${DIR}/${NAMES[$n]}*.${EXT} | wc -l`

while true ; do
	# echo ${ROOT}/${DIR}/${NAMES[$n]}${CNT}.${EXT}
	if [ -e ${ROOT}/${DIR}/${NAMES[$n]}${CNT}.${EXT} ] ; then
		#echo `date +"%s.%N"`
		#echo "! " ${ROOT}/${DIR}/${NAMES[$n]}${CNT}.${EXT}
		ln -sf ${ROOT}/${DIR}/${NAMES[$n]}${CNT}.${EXT} ./${OUTDIR}
	else
		sleep 10s
		break
	fi

	echo "{ \"streamMPD\": \"./${OUTDIR}/${NAMES[$n]}.mpd\", \"streamName\": \"${SETS[$n]%%/*}\", \"streamStart\": \"${START}\", \"totSegment\": ${TOT}, \"curSegment\": ${CNT}, \"segmentTime\": 2 }" > ./livestream.json

	CNT=$((CNT+1))
	sleep 2s
done

done # for

done # while true
