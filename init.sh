#!/bin/sh
echo "creating upload directory and symlinking"
mkdir -p shared/content/uploads
ln -fs ../../shared/content/uploads web/content/uploads
#echo "rsyncing production files to local"
#rsync -rzP "findsubstance.com:findsubstance.com/wp-content/uploads/*" ./shared/content/uploads/
echo "done"