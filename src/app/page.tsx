"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const rollDice = (sides: number, count: number): number => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

type Stats = {
  STR: number;
  CON: number;
  SIZ: number;
  DEX: number;
  APP: number;
  INT: number;
  POW: number;
  EDU: number;
  Luck: number;
  SAN: number;
  MP: number;
  HP: number;
};

const generateStats = (): Stats => {
  const STR = rollDice(6, 3) * 5;
  const CON = rollDice(6, 3) * 5;
  const SIZ = (rollDice(6, 2) + 6) * 5;
  const DEX = rollDice(6, 3) * 5;
  const APP = rollDice(6, 3) * 5;
  const INT = (rollDice(6, 2) + 6) * 5;
  const POW = rollDice(6, 3) * 5;
  const EDU = (rollDice(6, 2) + 6) * 5;
  const Luck = rollDice(6, 3) * 5;
  const SAN = POW;
  const MP = Math.floor(POW / 5);
  const HP = Math.floor((SIZ + CON) / 10);
  return { STR, CON, SIZ, DEX, APP, INT, POW, EDU, Luck, SAN, MP, HP };
};

type Profession = {
  formula: (...args: number[]) => number;
  skills: string[];
};

const professions: Record<string, Profession> = {
  "會計師": {
    formula: (edu: number) => edu * 4,
    skills: ["會計", "法律", "圖書館使用", "聆聽", "說服", "識破", "個人專長", "個人專長"],
  },
  "雜技演員": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["攀爬", "閃避", "跳躍", "投擲", "識破", "游泳", "個人專長", "個人專長"],
  },
  "機構探員": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["人際技能", "戰鬥(拳腳)", "火器", "法律", "圖書館使用", "心理學", "匿蹤", "追蹤"],
  },
  "精神病醫師": {
    formula: (edu: number) => edu * 4,
    skills: ["法律", "聆聽", "醫藥", "外語", "精神分析", "心理學", "科學(生物學)"],
  },
  "動物訓練師": {
    formula: (edu: number, app: number) => edu * 2 + app * 2,
    skills: ["跳躍", "聆聽", "自然世界", "心理學", "科學(動物)", "匿蹤", "追蹤", "個人專長"],
  },
  "古物愛好者": {
    formula: (edu: number) => edu * 4,
    skills: ["鑑定", "技藝(任意)", "歷史", "圖書館使用", "外語", "人際技能", "識破", "個人專長"],
  },
  "古董商": {
    formula: (edu: number) => edu * 4,
    skills: ["會計", "鑑定", "開車", "人際技能", "人際技能", "歷史", "圖書館使用", "導航"],
  },
  "考古學家": {
    formula: (edu: number) => edu * 4,
    skills: ["鑑定", "考古學", "歷史", "外語", "圖書館使用", "識破", "機械維修", "導航或科學"],
  },
  "建築師": {
    formula: (edu: number) => edu * 4,
    skills: ["會計", "技藝(繪圖技術)", "法律", "母語", "電腦使用或圖書館使用", "說服", "心理學", "科學(數學)"],
  },
  "藝術家": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["技藝(任意)", "歷史或自然世界", "人際技能", "外語", "心理學", "識破", "個人專長", "個人專長"],
  },
  "杜鵑窩專員": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["閃避", "戰鬥(拳腳)", "急救", "人際技能", "人際技能", "聆聽", "心理學", "匿蹤"],
  },
  "刺客": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["偽裝", "電器維修", "戰鬥", "火器", "鎖匠", "機械維修", "匿蹤", "心理學"],
  },
  "運動員": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["攀爬", "跳躍", "戰鬥(拳腳)", "騎術", "人際技能", "游泳", "投擲", "個人專長"],
  },
  "作家": {
    formula: (edu: number) => edu * 4,
    skills: ["技藝(文學)", "歷史", "圖書館使用", "自然世界或神祕學", "外語", "母語", "心理學", "個人專長"],
  },
  "特技飛行員": {
    formula: (edu: number) => edu * 4,
    skills: ["會計", "電器維修", "聆聽", "機械維修", "導航", "駕駛(飛機)", "識破", "個人專長"],
  },
  "銀行搶匪": {
    formula: (edu: number, str: number) => edu * 2 + str * 2,
    skills: ["", "", "", "", "", "", "", ""],
  },
  "酒保": {
    formula: (edu: number, app: number) => edu * 2 + app * 2,
    skills: ["會計", "人際技能", "人際技能", "戰鬥(拳腳)", "聆聽", "心理學", "識破", "個人專長"],
  },
  "巨獸獵人": {
    formula: (edu: number, str: number) => edu * 2 + str * 2,
    skills: ["火器", "聆聽或識破", "自然世界", "導航", "外語或生存(任意)", "科學(生物學或植物學)", "匿蹤", "追蹤"],
  },
  "書商": {
    formula: (edu: number) => edu * 4,
    skills: ["會計", "鑑定", "開車", "歷史", "圖書館使用", "母語", "外語", "人際技能"],
  },
  "不法買賣者/惡棍": {
    formula: (edu: number, str: number) => edu * 2 + str * 2,
    skills: ["開車", "戰鬥", "火器", "人際技能", "人際技能", "心理學", "匿蹤", "識破"],
  },
  "賞金獵人": {
    formula: (edu: number, str: number) => edu * 2 + str * 2,
    skills: ["開車", "電子學或電器維修", "戰鬥或火器", "人際技能", "法律", "心理學", "追蹤", "匿蹤"],
  },
  "拳擊手/摔角手": {
    formula: (edu: number, str: number) => edu * 2 + str * 2,
    skills: ["閃避", "戰鬥(拳腳)", "威脅", "跳躍", "心理學", "識破", "個人專長", "個人專長"],
  },
  "竊賊": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["鑑定", "攀爬", "電器或機械維修", "聆聽", "鎖匠", "巧手", "匿蹤", "識破"],
  },
  "執事/男侍/女僕": {
    formula: (edu: number) => edu * 4,
    skills: ["會計或鑑定", "技藝(任意)", "急救", "聆聽", "外語", "心理學", "識破", "個人專長", "個人專長"],
  },
  "私人駕駛": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["開車", "人際技能", "人際技能", "聆聽", "機械維修", "導航", "識破", "個人專長"],
  },
  "基督教牧師": {
    formula: (edu: number) => edu * 4,
    skills: ["會計", "歷史", "圖書館使用", "聆聽", "外語", "人際技能", "心理學", "個人專長"],
  },
  "通靈學家": {
    formula: (edu: number) => edu * 4,
    skills: ["人類學", "技藝(照相)", "歷史", "圖書館使用", "神祕學", "外語", "心理學", "個人專長"],
  },
  "反洗腦專員": {
    formula: (edu: number) => edu * 4,
    skills: ["人際技能", "人際技能", "開車", "戰鬥(拳腳)或火器", "歷史", "神祕學", "心理學", "匿蹤"],
  },
  "法醫": {
    formula: (edu: number) => edu * 4,
    skills: ["外語(拉丁文)", "圖書館使用", "醫藥", "說服", "科學(生物學)", "科學(鑑識學)", "科學(藥學)", "識破"],
  },
};


export default function CharacterGenerator() {
  const [age, setAge] = useState<number>(18);
  const [profession, setProfession] = useState<string>("會計師");
  const [stats, setStats] = useState<any | null>(null);
  //const [stats, setStats] = useState<CharacterStats | null>(null);
  const [skillPoints, setSkillPoints] = useState<number>(0);
  const [skillList, setSkillList] = useState<string[]>([]);
  // 用來記錄每個技能分配的點數
  const [skillAllocation, setSkillAllocation] = useState<{ [skill: string]: number }>({});
  // 用來記錄自訂的個人專長名稱（key: 個人專長1/2, value: 名稱）
  const [customSpecialties, setCustomSpecialties] = useState<{ [key: string]: string }>({});

  const generate = () => {
    let s = generateStats();
    s.Luck = rollDice(6, 3) * 5;
    s.SAN = s.POW;
    s.MP = Math.floor(s.POW / 5);
    s.HP = Math.floor((s.SIZ + s.CON) / 10);

    const prof = professions[profession];
    if (prof) {
      const points = prof.formula(s.EDU, s.DEX, s.STR, s.POW, s.APP);
      setSkillPoints(points);

      // 替換個人專長的名稱為使用者輸入的值，或預設
      const list = prof.skills.map((sk) => {
        if (sk.startsWith("個人專長")) {
          return customSpecialties[sk] || sk;
        }
        return sk;
      });
      setSkillList(list);

      // 初始化分配為0
      let initialAlloc: { [skill: string]: number } = {};
      list.forEach((sk) => (initialAlloc[sk] = 0));
      setSkillAllocation(initialAlloc);
    }
    setStats(s);
  };

  // 處理自訂專長名稱輸入改變
  const onCustomSpecialtyChange = (key: string, value: string) => {
    setCustomSpecialties((prev) => {
      const newCustom = { ...prev, [key]: value };
      // 更新技能清單名稱
      if (stats) {
        const prof = professions[profession];
        const list = prof.skills.map((sk) => {
          if (sk.startsWith("個人專長")) {
            return newCustom[sk] || sk;
          }
          return sk;
        });
        setSkillList(list);
      }
      return newCustom;
    });
  };

  // 處理技能點數分配輸入改變
  const onSkillPointChange = (skill: string, value: number) => {
    value = Math.max(0, Math.floor(value)); // 不允許負數且取整數
    const newAllocation = { ...skillAllocation, [skill]: value };
    const total = Object.values(newAllocation).reduce((a, b) => a + b, 0);
    if (total <= skillPoints) {
      setSkillAllocation(newAllocation);
    }
    // 如果超過，則不更新（或可改成提示錯誤）
  };

  const totalAllocated = Object.values(skillAllocation).reduce((a, b) => a + b, 0);
  const remainingPoints = skillPoints - totalAllocated;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">TRPG角色卡產生器</h1>
      <div className="flex gap-4 items-center">
        <label>年齡 <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></label>
        <label>職業
          <Select onValueChange={setProfession} defaultValue={profession}>
            <SelectTrigger><SelectValue placeholder="選擇職業" /></SelectTrigger>
            <SelectContent>
              {Object.keys(professions).map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <Button onClick={generate}>一鍵生成角色卡</Button>
      </div>

      {stats && (
        <Card>
          <CardContent className="p-4">
            <pre>{JSON.stringify(stats, null, 2)}</pre>
            <h2 className="font-bold mt-4">職業技能點數：{skillPoints}</h2>
            <p>剩餘點數：{remainingPoints}</p>

            <div>
              {skillList.map((skill, idx) => {
                // 如果是自訂專長名稱，顯示輸入框讓使用者輸入名稱
                if (skill.startsWith("個人專長")) {
                  return (
                    <div key={idx} className="mb-2">
                      <label>{skill}名稱：
                        <Input
                          type="text"
                          value={customSpecialties[`個人專長${skill.slice(-1)}`] || ""}
                          onChange={(e) => onCustomSpecialtyChange(`個人專長${skill.slice(-1)}`, e.target.value)}
                          placeholder="請輸入自訂技能名稱"
                          className="ml-2"
                        />
                      </label>
                      <label className="ml-4">
                        點數分配：
                        <Input
                          type="number"
                          min={0}
                          max={skillPoints}
                          value={skillAllocation[skill] || 0}
                          onChange={(e) => onSkillPointChange(skill, Number(e.target.value))}
                          className="ml-2 w-20"
                        />
                      </label>
                    </div>
                  );
                }
                // 一般技能直接顯示點數分配輸入框
                return (
                  <div key={idx} className="mb-2 flex items-center gap-4">
                    <span className="w-40">{skill}</span>
                    <Input
                      type="number"
                      min={0}
                      max={skillPoints}
                      value={skillAllocation[skill] || 0}
                      onChange={(e) => onSkillPointChange(skill, Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                );
              })}
            </div>

            {remainingPoints < 0 && (
              <p className="text-red-600 font-bold">技能點數分配超過總點數，請重新調整！</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
