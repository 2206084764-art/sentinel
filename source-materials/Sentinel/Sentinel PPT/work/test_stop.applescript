tell application "Microsoft PowerPoint"
 set p to presentation "Sentinel_S5_Webinar_Mac_Animated_Demo.pptx"
 set opts to slide show settings of p
 set range type of opts to slide show range
 set starting slide of opts to 5
 set ending slide of opts to 6
 set show type of opts to slide show type speaker
 set show with presenter of opts to false
 set sw to run slide show opts
 delay 1
 set v to slideshow view of sw
 set mp to get player from v for shape "Video product-reveal" of slide 5 of p
 play player mp
 delay 2
 set beforeLeave to {player state of mp, current position of mp}
 go to next slide v
 delay 1
 try
  set afterLeave to {player state of mp, current position of mp, slide index of slide of v}
 on error messageText number errorNumber
  set afterLeave to {"previous slide player disposed", errorNumber, slide index of slide of v}
 end try
 exit slide show v
 close p saving no
 open POSIX file "/Users/kevinwang/Documents/Streamax/Sentinel PPT/deliverables/Sentinel_S5_Webinar_Mac_Animated_Demo.pptx"
 return {beforeLeave, afterLeave, name of presentation 1, saved of presentation 1}
end tell
