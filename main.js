// スクリーンの縦横比
const SCREEN_ASPECT_RATIO_W = 16;
const SCREEN_ASPECT_RATIO_H = 9;

// キャンバスの拡大比
const CANVAS_EXPANSION_RATIO = 20;
// キャンバスのサイズ
const CANVAS_W = SCREEN_ASPECT_RATIO_W * CANVAS_EXPANSION_RATIO;
const CANVAS_H = SCREEN_ASPECT_RATIO_H * CANVAS_EXPANSION_RATIO;

// キャンバスの設定
const can = document.createElement("canvas");
const con = can.getContext("2d");
can.width = CANVAS_W;
can.height = CANVAS_H;
can.style.background = "#aaa";
document.body.appendChild(can);

/**
 * 円を描画する関数
 * @param {Number} x 座標
 * @param {Number} y 座標
 * @param {Number} r 半径
 * @param {String} c 色
 */
const drawP = (x, y, r, c) => {
    con.beginPath();
    con.arc(x, y, r, 0, Math.PI * 2, false);
    con.fillStyle = c;
    con.fill();
}

const sin = (theta) => Math.sin(theta * Math.PI / 180);
const cos = (theta) => Math.cos(theta * Math.PI / 180);
const tan = (theta) => Math.tan(theta * Math.PI / 180);


const key = {};
document.onkeydown = (e) => {
    key[e.key] = true;
    console.log(e.key);
}
document.onkeyup = (e) => {
    key[e.key] = false;
}

class Point {
    /**
     * 点クラス
     * @param {Number} x 座標
     * @param {Number} y 座標
     * @param {Number} z 座標
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Vector {
    /**
     * ベクトルクラス
     * @param {Point} point1 始点
     * @param {Point} point2 終点
     */
    constructor(point1, point2) {
        this.p1 = point1;
        this.p2 = point2;
        this.x = this.p2.x - this.p1.x;
        this.y = this.p2.y - this.p1.y;
        this.z = this.p2.z - this.p1.z;
        this.len = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
}

/**
 * 平面と線分の交点を求める関数
 * @param {Point} point 平面上の一点
 * @param {Vector} normalVector 平面の法線ベクトル
 * @param {Vector} lineSegmentVector 線分
 * @returns {Point} 平面と線分の交点
 */
const getIntersection = (point, normalVector, lineSegmentVector) => {
    const PA = new Vector(point, lineSegmentVector.p1);
    const PB = new Vector(point, lineSegmentVector.p2);
    const PAN = PA.x * normalVector.x + PA.y * normalVector.y + PA.z * normalVector.z;
    const PBN = PB.x * normalVector.x + PB.y * normalVector.y + PB.z * normalVector.z;
    const PAN_Len = Math.abs(PAN);
    const PBN_Len = Math.abs(PBN);
    const ratio = PAN_Len / (PAN_Len + PBN_Len);
    const itsX = lineSegmentVector.p1.x + lineSegmentVector.x * ratio;
    const itsY = lineSegmentVector.p1.y + lineSegmentVector.y * ratio;
    const itsZ = lineSegmentVector.p1.z + lineSegmentVector.z * ratio;
    const intersection = new Point(itsX, itsY, itsZ);
    return intersection;
}

const getIntersection2 = (focalLen, lineSegmentVector) => {
    const v1 = lineSegmentVector;
    const x1 = v1.p1.x + v1.x / v1.len * focalLen;
    const y1 = v1.p1.y + v1.y / v1.len * focalLen;
    const z1 = v1.p1.z + v1.z / v1.len * focalLen;
    return new Point(x1, y1, z1);
}


const points = [
    new Point(1, 1, 1),
    new Point(1, 3, 1),
    new Point(-1, 3, 1),
    new Point(-1, 1, 1),
    new Point(1, 1, -1),
    new Point(1, 3, -1),
    new Point(-1, 3, -1),
    new Point(-1, 1, -1),
];



class Camera {
    /**
     * カメラクラス
     * @param {Number} x x座標
     * @param {Number} y y座標
     * @param {Number} z z座標
     * @param {Number} rx x回転
     * @param {Number} rz z回転
     * @param {Number} focalLen 焦点距離
     * @param {Number} screenExpansion スクリーンのサイズ比
     */
    constructor(x, y, z, rx, rz, focalLen, screenExpansion) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.p1 = new Point(this.x, this.y, this.z);
        this.rx = rx;
        this.rz = rz;
        this.fl = focalLen;
        this.screenExp = screenExpansion;
        this.projectionExp = CANVAS_EXPANSION_RATIO / this.screenExp;
        this.speed = 0.05;
    }

    update() {
        if (key["w"]) {
            this.x += sin(this.rz) * this.speed;
            this.y += cos(this.rz) * this.speed;
        }
        if (key["a"]) {
            this.x += sin(this.rz - 90) * this.speed;
            this.y += cos(this.rz - 90) * this.speed;
        }
        if (key["s"]) {
            this.x += sin(this.rz + 180) * this.speed;
            this.y += cos(this.rz + 180) * this.speed;
        }
        if (key["d"]) {
            this.x += sin(this.rz + 90) * this.speed;
            this.y += cos(this.rz + 90) * this.speed;
        }

        if (key[" "]) this.z += this.speed;
        if (key["Shift"]) this.z -= this.speed;

        if (key["ArrowLeft"]) this.rz -= 3;
        if (key["ArrowRight"]) this.rz += 3;
        if (key["ArrowUp"]) this.rx -= 3;
        if (key["ArrowDown"]) this.rx += 3;

        this.p1 = new Point(this.x, this.y, this.z);
        const y1 = cos(this.rx);
        const z1 = -sin(this.rx);
        const x1 = sin(this.rz) * y1;
        const y2 = cos(this.rz) * y1;
        this.p2 = new Point(this.p1.x + x1, this.p1.y + y2, this.p1.z + z1);
        this.p3 = new Point(this.p1.x + x1 * this.fl, this.p1.y + y2 * this.fl, this.p1.z + z1 * this.fl);
        this.normalVector = new Vector(this.p3, this.p2);
    }

    projection() {
        for (const p of points) {
            const lineSegmentVector = new Vector(this.p1, p);
            const newP = getIntersection(this.p3, this.normalVector, lineSegmentVector);
            // const newP = getIntersection2(this.fl, lineSegmentVector);
            const PV = new Vector(this.p1, newP);
            // 回転軸A(a,b), 始点P(x,y), 終点P'(X,Y)
            // X - a = cosθ * (x - a) - sinθ * (y - b)
            // Y - b = sinθ * (x - a) + cosθ * (y - b)
            const x1 = cos(this.rz) * PV.x - sin(this.rz) * PV.y + this.p1.x;
            const y1 = sin(this.rz) * PV.x + cos(this.rz) * PV.y + this.p1.y;
            const z1 = cos(-this.rx) * PV.z - sin(-this.rx) * (y1 - this.p1.y) + this.p1.z;
            const y2 = sin(-this.rx) * PV.z + cos(-this.rx) * (y1 - this.p1.y) + this.p1.y;

            const newnewP = new Point(x1, y2, z1);

            const nx = can.width / 2 + (newnewP.x - this.p1.x) * this.projectionExp;
            const ny = can.height / 2 - (newnewP.z - this.p1.z) * this.projectionExp;
            drawP(nx, ny, 2, "#000");
        }
    }
}

const camera = new Camera(0, 0, 0, 0, 0, 0.006, 0.002);

const mainLoop = () => {
    con.clearRect(0, 0, can.width, can.height);
    camera.update();
    camera.projection();
}

setInterval(mainLoop, 33);