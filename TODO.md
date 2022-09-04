## misc

[] *important!* when talking: +15 xp animation above the user's head 

  -> LISA TODO: [] spritesheet

  -> appearing above its head, with slow movement up, then stop and float up and down for ~3 secs, then movement up with dissolve to disappear

  -> save this type of animation to be used later for gained items and other xp gains

# user-to-user interactions

[] *important!* !hug %username

  -> [] user who typed it floats over to the user he/she wants to hug, then they both perform a hug animation (the one who's on the left performs hug-right and the one who's on the right performs hug-left animation), then they continue on with their routine

  -> [] should not be possible if one of the users is already performing a labor (hunt, fish, gather, mine or build/steal)

  -> [] if the users perform a talking or consuming animation, it should stop

[] *important!* !bonk %username

  -> very same as the previous one, just with a different set of animations


# labors

[] !hunt

  -> [] background of a forest appears in some specific place on the canvas with dissolve (in case noone is doing hunting already)

  -> LISA TODO [] png forest location png (same for gather)

  -> [] user walks to that place (anywhere between x1 and x2, so all avatars don't just stand in one place)

  -> [] an animated icon appears above the user, indicating hunting

  -> [] the app already decides what item the user gets 

  -> [] after a specific amount of time, the labor is done, and the user plays the get-item animation, with the item's icon appearing above its head, with slow movement up, then stop, then movement up with dissolve to disappear

  -> [] afterwards, the user continues its routine of idle walking, meanwhile an icon with the same popping up animation appears above its head, saying they got 100 xp

  -> [] user has an inventory that stores the new item

[] !gather

  -> LISA TODO [] png forest location png (same for hunt)

[] !mine

  -> LISA TODO [] png cave location png

[] !fish

  -> LISA TODO [] png lake location png

# item interactions

[] !consume %item

  -> 

[] !craft %item

  ->

# log window
* TLDR: same as bot's chat messages in para's farm game, but packed onto the game canvas in some corner, not written in actual twitch chat

[] *important!* basic layout

[] *important!* messages when something happens

  -> "Hello %username, thanks for chatting!" on user's first chat/appearence"

  -> "%username hasn't written much in chat for a while now... Seems like they fell asleep!"

[] error messages when user tries to perform invalid action

[] !stats for user to ask for infos/inventory

# stats
* info that gets saved and can be looked up, or that allows silly stuff like "AnnoyingEdu is the number 1 hugger" or "kirinokirino is the most active player!"

[] inventory!

[] amount of xp!

[] basically save amount of every interaction/labor that took place

  -> most hugs, most bonks, most hunting, most gathering, most fishing, most mining, most labors performed, most items consumed, most items crafted, most stealing performed, most being stolen from (wait... maybe that's a bit too much?.. idk. maybe only pick the most interesting from those)

# misc

[] user appears by coming into the screen from the left or the right (no talking animation plays yet)

[] if user hasn't written anything in chat for 20 minutes: play z z z animation above their head and make them stop the idle walking routine

  -> LISA TODO: z z z spritesheet

  -> *important!* LISA TODO: think of something better for that (they get smaller? lay on the ground? go to specific location?)


