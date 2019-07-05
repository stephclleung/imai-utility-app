# imai-utility-app
Utility app for [PokerBot](https://github.com/BrianTsui2018/imai-poker) to handle bets and image rendering

## Routes :
* **/iu** : handles all image uploading requests from PokerBot\
* **/ua** : handles all user action requests from PokerBot\

## Image-Upload:
*  Takes a png file with 52 cards, cuts the image out base on PokerBot's request.\
*  Possible card combos :\
    *  Pair Cards : Half a card + One full card:\
        ![Pair Cards](https://i.imgur.com/EOzo2tJ.png)\
    *  Common Cards : 3 | 4 | 5 :\
        ![3 Common cards](https://i.imgur.com/thR0nKg.png)\
        ![5 Common cards](https://i.imgur.com/TQ40Qx2.png)\


## User-action:
*-* Handles a PUT request and POST request. Request fired by PokerBot.
