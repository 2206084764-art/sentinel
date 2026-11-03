tell application "Microsoft PowerPoint"
 set p to presentation "mac-normalized.pptx"
 set opts to slide show settings of p
 set range type of opts to slide show range
 set starting slide of opts to 5
 set ending slide of opts to 16
 set show with presenter of opts to false
 set show type of opts to slide show type window
 set showWindow to run slide show opts
 set v to slideshow view of showWindow
 set sh to shape "Video product-reveal" of slide 5 of p
 set moviePlayer to get player from v for sh
 play player moviePlayer
 delay 3
 set t to {player state of moviePlayer, current position of moviePlayer, current show position of v}
 return t
end tell
