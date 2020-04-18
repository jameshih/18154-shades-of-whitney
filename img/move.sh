i=1
for file in /Users/James/Desktop/whitneyRip_2/public/img/*/*.jpg; do
dirname=${file%/*}
newfile=/Users/James/Desktop/whitneyRip_2/public/output/$i.jpg
cp "$file" "$newfile" && ((++i))
done

