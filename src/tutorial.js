var lowfat = lowfat || {};

lowfat.TutorialNew = function (spriteFactory, getBoard, removeAllBlockModelsAndViews, createBlockView, setCurrentPack, setNextPack, setScore, getScoreUI, getSideMenu, setMaxUnlockedValue, screenWidthInPoints, fuseTracker) {
    var screenWidth = screenWidthInPoints;
    var container = null;
    var isMobile = false;
    var isActive = false;
    var gameStateModel = null;
    var popups = [];
    var popupGameGoal = null;
    var popupSwipe = null;
    var popupSwap = null;
    var dropPerformed = false;
    var dropFinished = false;
    var swapPerformed = false;
    var movePerformed = false;

    function init(containerParam, isMobileParam, gameStateModelParam) {
        container = containerParam;
        isMobile = isMobileParam;
        gameStateModel = gameStateModelParam;
        isActive = true;
        dropPerformed = false;
        dropFinished = false;
        swapPerformed = false;
        movePerformed = false;

        var introString = lowfat.LocalizationManager.getString("tutorial_goal");
        introString += "\n\n";
        introString += lowfat.LocalizationManager.getString(isMobile ? "tutorial_drop_mobile" : "tutorial_drop_pc");
        popupGameGoal = createPopup(introString);
        popupGameGoal.setPositionY(330);
        popupGameGoal.fadeIn();

        getBoard().clear();
        removeAllBlockModelsAndViews();
        createBlockView(getBoard().addBlockAt(1, 0, 1));
        createBlockView(getBoard().addBlockAt(1, 1, 1));
        createBlockView(getBoard().addBlockAt(3, 0, 1));
        createBlockView(getBoard().addBlockAt(4, 0, 1));
        setCurrentPack([1, 1]);
        setNextPack([2, 1]);
        setScore(0);
        getScoreUI().displayNewScoreInstantly(0);
        getSideMenu().setRestartAvailable(false);
        setMaxUnlockedValue(1);
    }

    function processDrop() {
        if (isActive === false || dropPerformed === true) {
            return;
        }

        popupGameGoal.fadeOut();
        dropPerformed = true;
    }

    function processSwipe() {
        if (isActive === false || movePerformed === true || isMobile === false) {
            return;
        }

        if (dropFinished) {
            popupSwipe.fadeOut();
            if (popupSwap !== null) {
                popupSwap.moveToY(360, 0.3);
            }

            if (swapPerformed === true) {
                tutorialFinished();
            }
        }

        movePerformed = true;
    }

    function processSwap() {
        if (isActive === false || swapPerformed === true) {
            return;
        }

        if (dropFinished) {
            popupSwap.fadeOut();
            if ((isMobile && movePerformed) || (isMobile === false)) {
                tutorialFinished();
            }
        }

        swapPerformed = true;
    }

    function processDropFinished() {
        if (isActive === false || dropFinished === true) {
            return;
        }

        var swapString;

        if (isMobile) {
            var popupsAmount;
            if (!swapPerformed && !movePerformed) {
                popupsAmount = 2;
            }
            else if (swapPerformed || movePerformed) {
                popupsAmount = 1;
            }
            else {
                popupsAmount = 0;
            }
            var swipeString = lowfat.LocalizationManager.getString("tutorial_swipe");
            swapString = lowfat.LocalizationManager.getString("tutorial_swap_mobile");

            if (popupsAmount === 2) {
                popupSwipe = createPopup(swipeString);
                popupSwap = createPopup(swapString);
                popupSwipe.setPositionY(360);
                popupSwap.setPositionY(270);
                popupSwipe.fadeIn();
                popupSwap.fadeIn(0.2);
            }
            else if (popupsAmount === 1) {
                if (!movePerformed) {
                    popupSwipe = createPopup(swipeString);
                    popupSwipe.setPositionY(360);
                    popupSwipe.fadeIn();
                } else {
                    popupSwap = createPopup(swapString);
                    popupSwap.setPositionY(360);
                    popupSwap.fadeIn();
                }
            } else {
                tutorialFinished();
            }
        } else {
            if (!swapPerformed) {
                swapString = lowfat.LocalizationManager.getString("tutorial_swap_pc");
                popupSwap = createPopup(swapString);
                popupSwap.setPositionY(360);
                popupSwap.fadeIn();
            } else {
                tutorialFinished();
            }
        }

        dropFinished = true;
    }

    function tutorialFinished() {
        getSideMenu().setRestartAvailable(true);
        gameStateModel.setIsTutorialFinished(true);
        fuseTracker.processTutorialFinished();
    }

    function onResize(width) {
        if (isActive === false) {
            return;
        }
        screenWidth = width;

        for (var i = 0; i < popups.length; i++) {
            popups[i].onResize(width);
        }
    }

    function createPopup(hint, header) {
        var popup = lowfat.TutorialPopup(container, hint, header, screenWidth);
        popups.push(popup);
        return popup;
    }

    return {
        init: init,
        processSwipe: processSwipe,
        processSwap: processSwap,
        processDrop: processDrop,
        processDropFinished: processDropFinished,
        onResize: onResize
    }
};

lowfat.TutorialPopup = function (container, descriptionText, headerText, screenWidth) {
    var node;
    var hasHeader = headerText !== undefined && headerText !== null && headerText !== "";
    var headerLabel = null;
    var descriptionLabel;
    var ANIMATION_DURATION = 0.5;
    var LABEL_MOVE_DISTANCE = 50;

    init();

    function init() {
        node = new cc.Node();
        container.addChild(node);
        node.setPosition(screenWidth / 2, 360);

        if (hasHeader) {
            headerLabel = createLabel(headerText, 42, 0, cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM);
            descriptionLabel = createLabel(descriptionText, 24, 1, cc.VERTICAL_TEXT_ALIGNMENT_TOP);
            headerLabel.setOpacity(0);
        } else {
            descriptionLabel = createLabel(descriptionText, 24, 0.5, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        }
        
        descriptionLabel.setOpacity(0);
    }

    function createLabel(text, fontSize, anchorPointY, textAlignment) {
        var label = new cc.LabelTTF(
            text,
            "OpenSansRegular",
            fontSize,
            cc.size(360, 340),
            cc.TEXT_ALIGNMENT_CENTER,
            textAlignment);
        label.setColor(cc.color(230, 230, 230));
        label.setAnchorPoint(0.5, anchorPointY);
        node.addChild(label);
        return label;
    }

    function slowlyShowWithHeader() {
        headerLabel.setPositionY(LABEL_MOVE_DISTANCE);
        var headerFadeInAction = new cc.FadeIn(ANIMATION_DURATION);
        var headerMoveInAction = new cc.MoveBy(ANIMATION_DURATION, 0, -LABEL_MOVE_DISTANCE).easing(cc.easeCubicActionOut());
        var headerSpawnAction = new cc.Spawn(headerMoveInAction, headerFadeInAction);
        headerLabel.runAction(headerSpawnAction);

        descriptionLabel.setPositionY(-LABEL_MOVE_DISTANCE);
        var descriptionFadeInAction = new cc.FadeIn(ANIMATION_DURATION);
        var descriptionMoveInAction = new cc.MoveBy(ANIMATION_DURATION, 0, LABEL_MOVE_DISTANCE).easing(cc.easeCubicActionOut());
        var descriptionSpawnAction = new cc.Spawn(descriptionMoveInAction, descriptionFadeInAction);
        descriptionLabel.runAction(descriptionSpawnAction);
    }

    function slowlyShowWithoutHeader() {
        descriptionLabel.setOpacity(0);
        descriptionLabel.setPositionX(-LABEL_MOVE_DISTANCE);
        var descriptionFadeInAction = new cc.FadeIn(ANIMATION_DURATION);
        var descriptionMoveInAction = new cc.MoveBy(ANIMATION_DURATION, LABEL_MOVE_DISTANCE, 0).easing(cc.easeCubicActionOut());
        var descriptionSpawnAction = new cc.Spawn(descriptionMoveInAction, descriptionFadeInAction);
        descriptionLabel.runAction(descriptionSpawnAction);
    }

    function slowlyHideWithHeader() {
        var headerFadeOutAction = new cc.FadeOut(ANIMATION_DURATION);
        var headerMoveOutAction = new cc.MoveBy(ANIMATION_DURATION, 0, LABEL_MOVE_DISTANCE).easing(cc.easeCubicActionOut());
        var headerSpawnAction = new cc.Spawn(headerMoveOutAction, headerFadeOutAction);
        headerLabel.runAction(headerSpawnAction);

        var descriptionFadeOutAction = new cc.FadeOut(ANIMATION_DURATION);
        var descriptionMoveOutAction = new cc.MoveBy(ANIMATION_DURATION, 0, -LABEL_MOVE_DISTANCE).easing(cc.easeCubicActionOut());
        var descriptionSpawnAction = new cc.Spawn(descriptionMoveOutAction, descriptionFadeOutAction);
        var cleanUpAction = new cc.CallFunc(cleanUp);
        descriptionLabel.runAction(new cc.Sequence(descriptionSpawnAction, cleanUpAction));
    }

    function slowlyHideWithoutHeader() {
        var descriptionFadeOutAction = new cc.FadeOut(ANIMATION_DURATION);
        var descriptionMoveOutAction = new cc.MoveBy(ANIMATION_DURATION, LABEL_MOVE_DISTANCE, 0).easing(cc.easeCubicActionOut());
        var descriptionSpawnAction = new cc.Spawn(descriptionMoveOutAction, descriptionFadeOutAction);
        var cleanUpAction = new cc.CallFunc(cleanUp);
        descriptionLabel.runAction(new cc.Sequence(descriptionSpawnAction, cleanUpAction));
    }

    function cleanUp() {
        if (headerLabel !== null) {
            headerLabel.removeFromParent();
        }
        descriptionLabel.removeFromParent();
        node.removeFromParent();
    }

    function setPositionY(coordY) {
        node.setPositionY(coordY);
    }

    function moveToY(toY, delay) {
        var delayAction = new cc.DelayTime(delay);
        var moveDuration = 0.3;
        var moveAction = new cc.MoveTo(moveDuration, node.getPositionX(), toY).easing(cc.easeCubicActionOut());
        node.runAction(new cc.Sequence(delayAction, moveAction));
    }

    function fadeIn() {
        if (hasHeader) {
            slowlyShowWithHeader();
        } else {
            slowlyShowWithoutHeader();
        }
    }

    function fadeOut() {
        if (hasHeader) {
            slowlyHideWithHeader();
        } else {
            slowlyHideWithoutHeader();
        }
    }

    function onResize(screenWidthInPoints) {
        node.setPositionX(screenWidthInPoints / 2);
    }

    return {
        setPositionY: setPositionY,
        moveToY: moveToY,
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        onResize: onResize
    }
};