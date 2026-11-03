tell application "Microsoft PowerPoint"
 set p to presentation "mac-normalized.pptx"
 set seq to main sequence of timeline of slide 4 of p
 repeat with i from 1 to 3
  set sh to shape ("Design question " & i) of slide 4 of p
  add effect seq for sh fx animation type appear trigger on page click
 end repeat
 repeat with slideNumber in {5, 7, 9, 10, 12, 16}
  repeat with sh in shapes of slide slideNumber of p
   if name of sh starts with "Video " then
    set settings to animation play settings of animation settings of sh
    set play on entry of settings to false
    set loop until stopped of settings to false
    set hide while not playing of settings to false
    set rewind move of settings to false
    set stop after slides of settings to 1
   end if
  end repeat
 end repeat
 save p
 return {count of effects of seq, name of p}
end tell
