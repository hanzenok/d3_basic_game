//global vars
var WIDTH = 800;
var HEIGHT = 600;
var PADDING = 5;
var RECT_SIZE = 40;
var RECT_RADIUS = 5;
var MOVE_DELTA = 4;
var BULLET_RADIUS = 6;
var SHOTS_SUCCEEDED = 0;
var SHOTS_FAILED = 0;
var MAX_SHOTS_FAILED = 10;
var MAX_SHOTS_SUCCEEDED = 20; // = nb enemy lifes

//css selectors
var PLAYER_SEL = '#player';
var ENEMY_SEL = '#enemy';
var ENEMY_LIFE_SEL = ENEMY_SEL + '_life';
var SCOREBOARD_SEL = '.failed_shots';
var WIN_MESS_SEL = '#won';
var LOST_MESS_SEL = '#lost';

//getters
var getPlayerX = function(){return +player.attr('x');};
var getEnemyX = function(){return +enemy.attr('x');};
var getEnemyY = function(){return HEIGHT/4;};

//svg
//attaching listeners
var svg = d3.select('svg')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
    .on('mousemove', movePlayer)
    .on('click', fireBullet);

//player
var player = d3.select(PLAYER_SEL)
    .attr('width', RECT_SIZE)
    .attr('height', RECT_SIZE)
    .attr('x', WIDTH/2 - RECT_SIZE/2)
    .attr('y', HEIGHT - RECT_SIZE - PADDING)
    .attr('rx', RECT_RADIUS)
    .attr('ry', RECT_RADIUS);

//enemy
var enemy = d3.select(ENEMY_SEL)
    .attr('width', RECT_SIZE)
    .attr('height', RECT_SIZE)
    .attr('x', WIDTH/2 - RECT_SIZE/2)
    .attr('y', getEnemyY())
    .attr('rx', RECT_RADIUS)
    .attr('ry', RECT_RADIUS);

//enemy life
var enemy_life = d3.select(ENEMY_LIFE_SEL)
    .attr('width', RECT_SIZE)
    .attr('height', 0)
    .attr('x', WIDTH/2 - RECT_SIZE/2)
    .attr('y', getEnemyY())
    .attr('rx', RECT_RADIUS)
    .attr('ry', RECT_RADIUS);

//start the loop
window.requestAnimationFrame(loop);

function movePlayer() {
    var point = d3.mouse(this);
    player.transition()
        .duration(50)
        .attr('x', point[0] - RECT_SIZE/2);
}

function moveEnemy() {
    var enemyX = getEnemyX();

    //if border
    if (enemyX > WIDTH - RECT_SIZE || enemyX < 0){
        MOVE_DELTA *= -1;
    }
    return enemyX += MOVE_DELTA;
}

function detectCollision() {
    //enemy
    var enemyX = getEnemyX();
    var enemyY = getEnemyY();

    //every bullet
    d3.selectAll('ellipse')
        .each(function() {
            var box = this.getBBox();
            var bulletX = box.x;
            var bulletY = box.y;

            //if bullet landed
            if ((bulletX + BULLET_RADIUS >= enemyX && bulletX - BULLET_RADIUS <= enemyX + RECT_SIZE) &&
                (bulletY + BULLET_RADIUS <= enemyY + RECT_SIZE && bulletY + BULLET_RADIUS >= enemyY)) {

                d3.select(this)
                    .call(shotSucceeded)
                    .remove()
                    .transition(); //stop the bullets transition
            }
        });
}

function shotSucceeded() {
    //count shots
    SHOTS_SUCCEEDED++;

    //decrese life
    d3.select(ENEMY_LIFE_SEL)
        .attr('height', SHOTS_SUCCEEDED*RECT_SIZE/MAX_SHOTS_SUCCEEDED);

    //if won
    if (SHOTS_SUCCEEDED >= MAX_SHOTS_SUCCEEDED) {
        d3.select(WIN_MESS_SEL)
            .style('display', 'flex');
    }
}

function shotFailed() {
    //count and show missed shots
    d3.select(SCOREBOARD_SEL).html(++SHOTS_FAILED);

    //if lost
    if (SHOTS_FAILED >= MAX_SHOTS_FAILED) {
        d3.select(LOST_MESS_SEL)
            .style('display', 'flex');
    }
}

function fireBullet() {
    svg.append('ellipse')
            .attr('class', 'bullet')
            .attr('cx', getPlayerX() + RECT_SIZE/2)
            .attr('cy', HEIGHT - RECT_SIZE - PADDING - BULLET_RADIUS)
            .attr('ry', BULLET_RADIUS)
            .attr('rx', BULLET_RADIUS/2)
        .transition()
            .duration(700)
            .attr('cy', -BULLET_RADIUS)
            .ease(d3.easeLinear)
            .on('end', shotFailed) //called when the transition is finished
            .remove();
}

function loop() {
    //move enemy
    var newX = moveEnemy();
    enemy.attr('x', newX)
        .call(detectCollision);
    enemy_life.attr('x', newX);

    //call itself
    window.requestAnimationFrame(loop);
}
