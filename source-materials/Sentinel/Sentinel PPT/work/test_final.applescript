tell application "Microsoft PowerPoint"
 set p to presentation "Sentinel_S5_Webinar_Mac_Animated_Demo.pptx"
 set opts to slide show settings of p
 set range type of opts to slide show range
 set starting slide of opts to 5
 set ending slide of opts to 16
 set show with presenter of opts to false
 set show type of opts to slide show type window
 set sw to run slide show opts
 delay 1
 set v to slideshow view of sw
 set logText to ""
 repeat with pair in {{5, "product-reveal"}, {7, "aov-demo"}, {9, "ai-detection"}, {10, "installation"}, {12, "iot-installation"}, {16, "product-rotation"}}
  set slideNumber to item 1 of pair
  repeat while (slide index of slide of v) < slideNumber
   go to next slide v
  end repeat
  delay 0.5
  set sh to shape ("Video " & item 2 of pair) of slide slideNumber of p
  set mp to get player from v for sh
  play player mp
  delay 3
  set logText to logText & "slide=" & slideNumber & ", state=" & (player state of mp as text) & ", position_ms=" & current position of mp & linefeed
  stop player mp
 end repeat
 go to previous slide v
 set logText to logText & "backward_navigation_slide=" & slide index of slide of v & linefeed
 go to next slide v
 set logText to logText & "forward_navigation_slide=" & slide index of slide of v & linefeed
 exit slide show v
 set range type of opts to slide show range show all
 set starting slide of opts to 1
 set show type of opts to slide show type speaker
 set show with presenter of opts to true
 set logText to logText & "native_question_effects=" & count of effects of main sequence of timeline of slide 4 of p & linefeed
 set sh to shape "Speaker" of slide 1 of p
 set originalText to content of text range of text frame of sh
 set content of text range of text frame of sh to "Speaker: [QA edit check]"
 set logText to logText & "text_edit_confirmed=" & ((content of text range of text frame of sh) is "Speaker: [QA edit check]") & linefeed
 set content of text range of text frame of sh to originalText
 save p
 set logText to logText & "saved=" & saved of p & linefeed
 return logText
end tell
