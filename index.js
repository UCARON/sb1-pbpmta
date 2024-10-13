require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());

// ゲームの状態を取得
app.get('/game-state', async (req, res) => {
  const { data, error } = await supabase
    .from('game_state')
    .select('*')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// プレイヤーの行動を記録
app.post('/player-action', async (req, res) => {
  const { playerId, action } = req.body;

  const { data, error } = await supabase
    .from('player_actions')
    .insert({ player_id: playerId, action });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Action recorded successfully' });
});

// ボスの状態を更新
app.put('/update-boss', async (req, res) => {
  const { bossHealth } = req.body;

  const { data, error } = await supabase
    .from('game_state')
    .update({ boss_health: bossHealth })
    .eq('id', 1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Boss state updated successfully' });
});

// マスターデータを取得
app.get('/master-data', async (req, res) => {
  const { data: bossData, error: bossError } = await supabase
    .from('boss_master')
    .select('*');

  const { data: puzzleData, error: puzzleError } = await supabase
    .from('puzzle_master')
    .select('*');

  if (bossError || puzzleError) {
    return res.status(500).json({ error: 'Failed to fetch master data' });
  }

  res.json({
    bosses: bossData,
    puzzles: puzzleData
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});