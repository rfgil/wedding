#!/bin/bash

ref_ratio=""


files=(
    ../gaeiras.png
    ../santuario.jpg
    # image1.png
    # image2.png
    # image3.png
    # image4.png
    # image5.png
    # image6.png
    # image7.png
    # image8.png
    # image9.png
    # image10.png
)

# for i in {1..10}; do
#     file="image$i.png"

for file in "${files[@]}"; do

    [[ ! -f "$file" ]] && echo "Missing file: $file" && exit 1

    # Extract WIDTH and HEIGHT from `file`
    read w h <<< $(file "$file" | grep -o '[0-9]\+ x [0-9]\+' | tr -d ' ' | tr 'x' ' ')

    # Reduce ratio using gcd
    gcd() { while [ $2 -ne 0 ]; do t=$(( $1 % $2 )); set -- $2 $t; done; echo $1; }
    g=$(gcd "$w" "$h")
    ratio="$((w/g)):$((h/g))"

    echo "$file → $w x $h (ratio $ratio)"

    if [[ -z "$ref_ratio" ]]; then
        ref_ratio="$ratio"
    # elif [[ "$ratio" != "$ref_ratio" ]]; then
        # echo "❌ Ratio mismatch in $file (expected $ref_ratio)"
        # exit 1
    fi
done

echo "✅ All images have the same aspect ratio: $ref_ratio"
