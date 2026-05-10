# Djibouti Caves

## Play Online
**[Play the web version here!](https://thecrazy8.github.io/SOLID-GUACAMOLE/)**

## Requirements
- **Web Version**: Any modern web browser with JavaScript enabled
- **Java Version**: You need a Java compiler that allows for *JavaFX swing* and a terminal that accepts input readable by a Java scanner.


**BASICS**
Your objective is to find **Djibouti** and escape alive.
Darker colors signify being closer to **Djibouti**.
Lighter colors - especially gray - indicate being further from **Djibouti**.
**Djibouti** is a yellow checkered pattern you can collect by moving close to it.
Once you have collected **Djibouti**, return to the entryway from which you came.

**HAZARDS**
Don't stare into Djibouti hole for too long. If you haven't found **Djibouti** yet, it will send you to another permutation of Djibouti caves. If you have found it, radiant Djibouti energy from Djibouti amplifies the psionic effect of starting into Djibouti hole, killing you. This is called a RECLAMATION event.
Staring into Djibouti hole will cause lag, forcing you to stare into it longer. Be cautious when looking around corners.
Attempting to enter Djibouti hole will kill you.
A RECLAMATION event has a small chance to trap you in a wall, softlocking you.
A RECLAMATION event has a small chance to create Djibouti hole in such a place that you are already staring into it. You can avoid a RECLAMATION event with good reflexes.
A RECLAMATION event will move Djibouti elsewhere.

After collecting **Djibouti**, you will move faster and the map will begin to change dependent on your settings.
If additive collapse is enabled, new walls will periodically appear in random places in the Djibouti caves. This may have no effect, replace certain walls' colors, or block off certain routes. Taking too long to return to the exit means it will be entirely blocked off. Be quick.
If subtractive collapse is enabled, random walls will periodically be removed in random places. This might make escape easier, but is also likely to create new Djibouti holes.

**VERBOSITY**
You will be asked on startup to select a value from zero to three regarding 'information verbosity'.
You can look at the output of the game in the terminal for pertinent information.

0 - DEBUG : All possible information printed, including the map layout. You begin at (4, 4).
1 - ASSISTED : Extra information printed, such as the location of newly collapsed sectors.
2 - UNASSISTED : Some information printed, such as your sanity level (decreases by staring into Djibouti hole), which determines the time until a RECLAMATION event.
3 - IN THE LAND OF THE BLIND : The one eyed man is king. Nothing printed. Good luck.
