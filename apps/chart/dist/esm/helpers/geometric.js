const RAD = Math.PI / 180;
const ANGLE_90 = 90;
// From 0 to 90 degrees inclusive.
export const ANGLE_CANDIDATES = Array.from(new Array(91), (v, i) => i);
/**
 * Calculate adjacent.
 *
 *   H : Hypotenuse
 *   A : Adjacent
 *   O : Opposite
 *   D : Degree
 *
 *        /|
 *       / |
 *    H /  | O
 *     /   |
 *    /\ D |
 *    -----
 *       A
 */
function calculateAdjacent(degree, hypotenuse) {
    return Math.cos(degree * RAD) * hypotenuse;
}
function calculateOpposite(degree, hypotenuse) {
    return Math.sin(degree * RAD) * hypotenuse;
}
export function calculateRotatedWidth(degree, width, height) {
    const centerHalf = calculateAdjacent(degree, width);
    const sideHalf = calculateOpposite(degree, height);
    return centerHalf + sideHalf;
}
export function calculateRotatedHeight(degree, width, height) {
    const centerHalf = calculateOpposite(degree, width);
    const sideHalf = calculateAdjacent(degree, height);
    return centerHalf + sideHalf;
}
