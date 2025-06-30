"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const rollDice = (sides: number, count: number) => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

const generateStats = () => {
  return {
    STR: rollDice(6, 3) * 5,
    CON: rollDice(6, 3) * 5,
    SIZ: (rollDice(6, 2) + 6) * 5,
    DEX: rollDice(6, 3) * 5,
    APP: rollDice(6, 3) * 5,
    INT: (rollDice(6, 2) + 6) * 5,
    POW: rollDice(6, 3) * 5,
    EDU: (rollDice(6, 2) + 6) * 5,
  };
};

// 這裡簡化示範，只列三個職業
const professions = {
  "會計師": {
    eng: "Accountant",
    formula: (edu) => edu * 4,
    skills: ["會計", "法律", "圖書館使用", "聆聽", "說服", "識破", "個人專長", "個人專長"],
  },
};


export default function CharacterGenerator() {
  const [age, setAge] = useState<number>(18);
  const [profession, setProfession] = useState<string>("會計師");
  const [stats, setStats] = useState<any | null>(null);
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
      const points = prof.formula(s.EDU, s.DEX, s.STR);
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
