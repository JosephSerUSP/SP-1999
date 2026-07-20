const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const dataFilePath = path.join(__dirname, '../src/data.js');

app.get('/api/data', (req, res) => {
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const vm = require('vm');
        const sandbox = {
            CONFIG: {},
            TRAIT_PARAM_PLUS: 1,
            TRAIT_PARAM_RATE: 2,
            TRAIT_RESTRICTION: 3,
            TRAIT_ATTACK_SKILL: 4,
            EFFECT_DAMAGE: 11,
            EFFECT_HEAL: 12,
            EFFECT_ADD_STATE: 21,
            EFFECT_REMOVE_STATE: 22,
            EFFECT_RECOVER_PE: 31,
            EFFECT_SCAN_MAP: 41,
            PARAM_MAXHP: 0,
            PARAM_MAXPE: 1,
            PARAM_ATK: 2,
            PARAM_DEF: 3,
        };
        const script = new vm.Script(fileContent + '\n' + `
            const exports = {
                $dataStates: typeof $dataStates !== "undefined" ? $dataStates : {},
                $dataSkills: typeof $dataSkills !== "undefined" ? $dataSkills : {},
                $dataClasses: typeof $dataClasses !== "undefined" ? $dataClasses : {},
                $dataEnemies: typeof $dataEnemies !== "undefined" ? $dataEnemies : [],
                $dataLootTable: typeof $dataLootTable !== "undefined" ? $dataLootTable : {},
                $dataFloors: typeof $dataFloors !== "undefined" ? $dataFloors : {},
                $dataCutscenes: typeof $dataCutscenes !== "undefined" ? $dataCutscenes : {}
            };
            exports;
        `);
        const result = script.runInNewContext(sandbox);

        const safeResult = JSON.parse(JSON.stringify(result, (key, val) => {
            if (typeof val === 'function') {
                return val.toString();
            }
            return val;
        }));

        res.json(safeResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

function replaceObjectInJS(fileContent, varName, newObj) {
    const prefix = `const ${varName} = `;
    const startIndex = fileContent.indexOf(prefix);
    if (startIndex === -1) return fileContent;

    let objStart = startIndex + prefix.length;
    while (fileContent[objStart] === ' ' || fileContent[objStart] === '\n' || fileContent[objStart] === '\r') {
        objStart++;
    }

    const openChar = fileContent[objStart];
    if (openChar !== '{' && openChar !== '[') return fileContent;
    const closeChar = openChar === '{' ? '}' : ']';

    let depth = 0;
    let inString = false;
    let escape = false;
    let objEnd = objStart;

    for (let i = objStart; i < fileContent.length; i++) {
        const char = fileContent[i];
        if (inString) {
            if (escape) {
                escape = false;
            } else if (char === '\\') {
                escape = true;
            } else if (char === inString) {
                inString = false;
            }
        } else {
            if (char === '"' || char === "'" || char === "`") {
                inString = char;
            } else if (char === '/' && fileContent[i+1] === '/') {
                while (i < fileContent.length && fileContent[i] !== '\n') i++;
            } else if (char === '/' && fileContent[i+1] === '*') {
                i += 2;
                while (i < fileContent.length && !(fileContent[i-1] === '*' && fileContent[i] === '/')) i++;
            } else if (char === openChar) {
                depth++;
            } else if (char === closeChar) {
                depth--;
                if (depth === 0) {
                    objEnd = i + 1;
                    break;
                }
            }
        }
    }

    let jsonStr = JSON.stringify(newObj, null, 4);

    jsonStr = jsonStr.replace(/"(\([^)]*\)\s*=>\s*(?:[^"\\]|\\.)*)"/g, (match, p1) => {
        return p1.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    });

    jsonStr = jsonStr.replace(/"code":\s*11/g, '"code": EFFECT_DAMAGE');
    jsonStr = jsonStr.replace(/"code":\s*12/g, '"code": EFFECT_HEAL');
    jsonStr = jsonStr.replace(/"code":\s*21/g, '"code": EFFECT_ADD_STATE');
    jsonStr = jsonStr.replace(/"code":\s*22/g, '"code": EFFECT_REMOVE_STATE');
    jsonStr = jsonStr.replace(/"code":\s*31/g, '"code": EFFECT_RECOVER_PE');
    jsonStr = jsonStr.replace(/"code":\s*41/g, '"code": EFFECT_SCAN_MAP');

    jsonStr = jsonStr.replace(/"code":\s*1/g, '"code": TRAIT_PARAM_PLUS');
    jsonStr = jsonStr.replace(/"code":\s*2/g, '"code": TRAIT_PARAM_RATE');
    jsonStr = jsonStr.replace(/"code":\s*3/g, '"code": TRAIT_RESTRICTION');
    jsonStr = jsonStr.replace(/"code":\s*4/g, '"code": TRAIT_ATTACK_SKILL');

    jsonStr = jsonStr.replace(/"code":\s*TRAIT_PARAM_PLUS,\s*"dataId":\s*3/g, '"code": TRAIT_PARAM_PLUS, "dataId": PARAM_DEF');
    jsonStr = jsonStr.replace(/"code":\s*TRAIT_PARAM_PLUS,\s*"dataId":\s*2/g, '"code": TRAIT_PARAM_PLUS, "dataId": PARAM_ATK');

    jsonStr = jsonStr.replace(/"([A-Za-z0-9_]+)":/g, '$1:');

    return fileContent.slice(0, objStart) + jsonStr + fileContent.slice(objEnd);
}

app.post('/api/data', (req, res) => {
    try {
        let fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const newData = req.body;

        if (newData.$dataStates) fileContent = replaceObjectInJS(fileContent, '$dataStates', newData.$dataStates);
        if (newData.$dataSkills) fileContent = replaceObjectInJS(fileContent, '$dataSkills', newData.$dataSkills);
        if (newData.$dataClasses) fileContent = replaceObjectInJS(fileContent, '$dataClasses', newData.$dataClasses);
        if (newData.$dataEnemies) fileContent = replaceObjectInJS(fileContent, '$dataEnemies', newData.$dataEnemies);
        if (newData.$dataLootTable) fileContent = replaceObjectInJS(fileContent, '$dataLootTable', newData.$dataLootTable);
        if (newData.$dataFloors) fileContent = replaceObjectInJS(fileContent, '$dataFloors', newData.$dataFloors);
        if (newData.$dataCutscenes) fileContent = replaceObjectInJS(fileContent, '$dataCutscenes', newData.$dataCutscenes);

        fs.writeFileSync(dataFilePath, fileContent, 'utf-8');
        res.json({ message: "Saved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Editor running on http://localhost:${PORT}`);
});
