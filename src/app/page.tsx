"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const interpersonalOptions = ["魅力", "威脅", "話術", "說服"];

const professions: Record<string, Profession> = {
  "會計師": {
    formula: (edu) => edu * 4,
    skills: ["會計","法律","圖書館使用","聆聽","說服","識破","個人專長","個人專長"],
  },
  "雜技演員": {
    formula: (edu, dex) => edu * 2 + dex * 2,
    skills: ["攀爬","閃避","跳躍","投擲","識破","游泳","個人專長","個人專長"],
  },
  "機構探員": {
    formula: (edu, dex) => edu * 2 + dex * 2,
    skills: ["人際技能","戰鬥(拳腳)","火器","法律","圖書館使用","心理學","匿蹤","追蹤"],
  },
  "精神病醫師": {
    formula: (edu) => edu * 4,
    skills: ["法律","聆聽","醫藥","外語","精神分析","心理學","科學(生物學)"],
  },
  "動物訓練師": {
    formula: (edu, app) => edu * 2 + app * 2,
    skills: ["跳躍","聆聽","自然世界","心理學","科學(動物)","匿蹤","追蹤","個人專長"],
  },
  "古物愛好者": {
    formula: (edu) => edu * 4,
    skills: ["鑑定","技藝(任意)","歷史","圖書館使用","外語","人際技能","識破","個人專長"],
  },
  "古董商": {
    formula: (edu) => edu * 4,
    skills: ["會計","鑑定","開車","人際技能","人際技能","歷史","圖書館使用","導航"],
  },
  "考古學家": {
    formula: (edu) => edu * 4,
    skills: ["鑑定","考古學","歷史","外語","圖書館使用","識破","機械維修","導航或科學"],
  },
  "建築師": {
    formula: (edu) => edu * 4,
    skills: ["會計","技藝(繪圖技術)","法律","母語","電腦使用或圖書館使用","說服","心理學","科學(數學)"],
  },
  "藝術家": {
    formula: (edu, dex) => edu * 2 + dex * 2,
    skills: ["技藝(任意)","歷史或自然世界","人際技能","外語","心理學","識破","個人專長","個人專長"],
  },
  "制服警察": {
    formula: (edu, dex) => edu * 2 + dex * 2,
    skills: ["戰鬥(空手)","火器","急救","人際技能","法律","心理學","識破","下列選一：開車或騎術"],
  },
};

export default function CharacterGenerator() {
  const [age, setAge] = useState<number>(18);
  const [profession, setProfession] = useState<string>("會計師");
  const [stats, setStats] = useState<Stats | null>(null);
  const [skillPoints, setSkillPoints] = useState<number>(0);
  const [skillList, setSkillList] = useState<string[]>([]);
  const [skillAllocation, setSkillAllocation] = useState<{ [skill: string]: number }>(
    {}
  );
  const [customSpecialties, setCustomSpecialties] = useState<{ [key: string]: string }>(
    {}
  );
  const [interpersonalSkills, setInterpersonalSkills] = useState<string[]>([]);

  // 統計職業技能中各種類的出現次數，用於建立對應輸入欄位
  const countInterpersonal =
    professions[profession]?.skills.filter((s) => s === "人際技能").length || 0;

  // 這三種都視為自訂技能
  const customSkillTypes = ["個人專長", "學術專長", "研讀領域"];

  // 計算自訂技能出現的次數(包含三種類型)
  const countCustomSkills = professions[profession]?.skills.filter((s) =>
    customSkillTypes.includes(s)
  ).length || 0;

  useEffect(() => {
    setInterpersonalSkills(Array(countInterpersonal).fill(""));
  }, [profession, countInterpersonal]);

  const generate = () => {
    if (!stats) {
      const s = generateStats();
      setStats(s);
      const prof = professions[profession];
      if (prof) {
        const points = prof.formula(s.EDU, s.DEX, s.STR);
        setSkillPoints(points);

        // 產生技能列表，替換自訂技能名稱為使用者輸入，否則保留原字串
        const list = prof.skills.map((sk, idx) => {
          if (customSkillTypes.includes(sk)) {
            return customSpecialties[`${sk}-${idx}`] || sk;
          }
          if (sk === "人際技能") {
            return sk; // 留給互動欄位處理
          }
          return sk;
        });
        setSkillList(list);

        let initialAlloc: { [skill: string]: number } = {};
        list.forEach((sk) => (initialAlloc[sk] = 0));
        setSkillAllocation(initialAlloc);
      }
    }
  };

  const onCustomSpecialtyChange = (key: string, value: string) => {
    setCustomSpecialties((prev) => {
      const newCustom = { ...prev, [key]: value };
      if (stats) {
        const prof = professions[profession];
        if (prof) {
          const list = prof.skills.map((sk, idx) => {
            if (customSkillTypes.includes(sk)) {
              return newCustom[`${sk}-${idx}`] || sk;
            }
            return sk;
          });
          setSkillList(list);
        }
      }
      return newCustom;
    });
  };

  const onSkillPointChange = (skill: string, value: number) => {
    value = Math.max(0, Math.floor(value));
    const newAllocation = { ...skillAllocation, [skill]: value };
    const total = Object.values(newAllocation).reduce((a, b) => a + b, 0);
    if (total <= skillPoints) {
      setSkillAllocation(newAllocation);
    }
  };

  const onInterpersonalChange = (index: number, value: string) => {
    setInterpersonalSkills((prev) => {
      const newArr = [...prev];
      newArr[index] = value;
      return newArr;
    });
  };

  const getAvailableInterpersonalOptions = (index: number) => {
    return interpersonalOptions.filter(
      (opt) => !interpersonalSkills.includes(opt) || interpersonalSkills[index] === opt
    );
  };

  const totalAllocated = Object.values(skillAllocation).reduce((a, b) => a + b, 0);
  const remainingPoints = skillPoints - totalAllocated;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">TRPG角色卡產生器</h1>
      <div className="flex gap-4 items-center">
        <label>
          年齡{" "}
          <Input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </label>
        <label>
          職業
          <Select onValueChange={setProfession} value={profession}>
            <SelectTrigger>
              <SelectValue placeholder="選擇職業" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(professions).map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
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
                if (skill === "人際技能") {
                  const interpersonalIndex = skillList
                    .slice(0, idx + 1)
                    .filter((s) => s === "人際技能").length - 1;
                  return (
                    <div key={`interpersonal-${idx}`} className="mb-2">
                      <label>人際技能選擇 {interpersonalIndex + 1}：</label>
                      <Select
                        value={interpersonalSkills[interpersonalIndex] || ""}
                        onValueChange={(val) => onInterpersonalChange(interpersonalIndex, val)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="請選擇" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableInterpersonalOptions(interpersonalIndex).map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                } else if (customSkillTypes.some((type) => skillList[idx].startsWith(type))) {
                  // 找到原始技能類型索引，作為key標記
                  const originalType = professions[profession].skills[idx];
                  return (
                    <div key={`customskill-${idx}`} className="mb-2">
                      <label>{originalType}自訂名稱：</label>
                      <Input
                        type="text"
                        value={customSpecialties[`${originalType}-${idx}`] || ""}
                        onChange={(e) => onCustomSpecialtyChange(`${originalType}-${idx}`, e.target.value)}
                      />
                    </div>
                  );
                } else if (skill.startsWith("下列選一：")) {
                  const optionsText = skill.replace("下列選一：", "");
                  const options = optionsText.split("或").map((s) => s.trim());
                  const key = `choose-${idx}`;
                  const chosen = customSpecialties[key] || "";

                  return (
                    <div key={key} className="mb-2">
                      <label>請選擇技能：</label>
                      <Select
                        value={chosen}
                        onValueChange={(val) =>
                          setCustomSpecialties((prev) => ({ ...prev, [key]: val }))
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="請選擇" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                } else {
                  return (
                    <div key={skill} className="mb-2">
                      <label>
                        {skill}：
                        <Input
                          type="number"
                          min={0}
                          max={999}
                          value={skillAllocation[skill] || 0}
                          onChange={(e) =>
                            onSkillPointChange(skill, Number(e.target.value))
                          }
                          className="w-20"
                        />
                      </label>
                    </div>
                  );
                }
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
