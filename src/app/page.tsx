"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const interpersonalOptions = ["魅力", "威脅", "話術", "說服"];

const extractChoiceSkill = (skill: string): string[] => {
  const match = skill.match(/^下列選一：(.+)$/);
  if (!match) return [];
  return match[1].split("或").map(s => s.trim());
};

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

const professions = {
  "會計師": {
    formula: (edu: number) => edu * 4,
    skills: ["會計", "法律", "圖書館使用", "聆聽", "說服", "識破", "個人專長", "個人專長"],
  },
  "制服警察": {
    formula: (edu: number, dex: number) => edu * 2 + dex * 2,
    skills: ["戰鬥(空手)", "火器", "急救", "人際技能", "法律", "心理學", "識破", "下列選一：開車或騎術"],
  },
};

export default function CharacterGenerator() {
  const [profession, setProfession] = useState<string>("會計師");
  const [stats, setStats] = useState<Stats | null>(null);
  const [skillPoints, setSkillPoints] = useState<number>(0);
  const [allocatedSkills, setAllocatedSkills] = useState<{ [skill: string]: number }>({});
  const [interpersonalChoices, setInterpersonalChoices] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState<{ [key: string]: string }>({});

  const handleGenerate = () => {
    const s = generateStats();
    setStats(s);

    const prof = professions[profession];
    if (prof) {
      const points = prof.formula(s.EDU, s.DEX, s.STR, s.APP);
      setSkillPoints(points);

      const list = prof.skills.map((sk, idx) => {
        if (sk.startsWith("個人專長") || sk.startsWith("學術專長") || sk.startsWith("研讀領域")) {
          return customSpecialties[`${sk}${idx}`] || sk;
        }
        const choices = extractChoiceSkill(sk);
        if (choices.length > 0) {
          return choiceSelections[sk] || choices[0]; // 用已選或預設第一個
        }
        if (sk === "人際技能") {
          return interpersonalSelections[idx] || "魅力";
        }
        return sk;
      });

      setSkillList(list);
}

    });

    setInterpersonalChoices(Array(interpersonalCount).fill(""));
    setCustomSkills(Object.fromEntries(customKeys.map((key, i) => [`custom-${i}`, ""])));
    setAllocatedSkills(Object.fromEntries([...baseSkills, ...Array(interpersonalCount).fill(""), ...Object.keys(customSkills)].map(k => [k, 0])));
  };

  const updateSkillPoints = (skill: string, value: number) => {
    const updated = { ...allocatedSkills, [skill]: value };
    const total = Object.values(updated).reduce((a, b) => a + b, 0);
    if (total <= skillPoints) setAllocatedSkills(updated);
  };

  const usedPoints = Object.values(allocatedSkills).reduce((a, b) => a + b, 0);
  const remainingPoints = skillPoints - usedPoints;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">TRPG角色卡產生器</h1>

      <Select value={profession} onValueChange={setProfession}>
        <SelectTrigger><SelectValue placeholder="選擇職業" /></SelectTrigger>
        <SelectContent>
          {Object.keys(professions).map((key) => (
            <SelectItem key={key} value={key}>{key}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleGenerate}>生成角色</Button>

      {stats && (
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold mb-2">能力值</h2>
            <pre className="mb-4">{JSON.stringify(stats, null, 2)}</pre>

            <h2 className="font-bold mb-2">職業技能點：{skillPoints}</h2>
            <p>剩餘點數：{remainingPoints}</p>

            <div className="space-y-2 mt-4">
              {interpersonalChoices.map((choice, index) => (
                <div key={`inter-${index}`} className="flex items-center gap-2">
                  <span>人際技能{index + 1}：</span>
                  <Select value={choice} onValueChange={(val) => {
                    const updated = [...interpersonalChoices];
                    updated[index] = val;
                    setInterpersonalChoices(updated);
                  }}>
                    <SelectTrigger><SelectValue placeholder="選擇人際技能" /></SelectTrigger>
                    <SelectContent>
                      {interpersonalOptions
                        .filter(opt => !interpersonalChoices.includes(opt))
                        .map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    className="w-20"
                    min={0}
                    value={allocatedSkills[choice] || 0}
                    onChange={(e) => updateSkillPoints(choice, Number(e.target.value))}
                  />
                </div>
              ))}

              {Object.entries(customSkills).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input
                    placeholder="自訂技能名稱"
                    value={value}
                    onChange={(e) => {
                      const updated = { ...customSkills, [key]: e.target.value };
                      setCustomSkills(updated);
                    }}
                  />
                  <Input
                    type="number"
                    className="w-20"
                    min={0}
                    value={allocatedSkills[value] || 0}
                    onChange={(e) => updateSkillPoints(value, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
