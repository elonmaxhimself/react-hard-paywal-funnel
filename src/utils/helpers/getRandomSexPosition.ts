export function getRandomSexPosition(sexPositions: Array<{ value: string }>) {
    const index = Math.floor(Math.random() * sexPositions.length);
    return sexPositions[index].value;
}