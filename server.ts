import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  Tournament,
  Transaction,
  WithdrawalRequest,
  Notification,
  Announcement,
  LeaderboardPlayer
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Persistent database file
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'arena-db.json');

interface DatabaseSchema {
  users: User[];
  tournaments: Tournament[];
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  notifications: Notification[];
  announcements: Announcement[];
}

function getInitialDatabase(): DatabaseSchema {
  return {
    users: [
      {
        id: 'admin_1',
        email: 'admin@ffbattle.gg',
        phone: '9876543210',
        username: 'FF_ARENA_COMMANDER',
        ffUid: '100000001',
        ffIgn: 'FF_COMMANDER',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Commander&backgroundColor=b91c1c',
        role: 'admin',
        status: 'active',
        depositBalance: 25000,
        winningBalance: 50000,
        totalKills: 840,
        matchesPlayed: 120,
        matchesWon: 64,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'user_viper',
        email: 'gamer@ffbattle.gg',
        phone: '9123456780',
        username: 'ViperStriker_99',
        ffUid: '784920152',
        ffIgn: 'VIPER・99',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Viper&backgroundColor=dc2626',
        role: 'user',
        status: 'active',
        depositBalance: 350,
        winningBalance: 840,
        totalKills: 284,
        matchesPlayed: 45,
        matchesWon: 18,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 'user_apex',
        email: 'apex@ffbattle.gg',
        phone: '9811223344',
        username: 'ApexPredator',
        ffUid: '629401732',
        ffIgn: 'APEX・GOD',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Apex&backgroundColor=ea580c',
        role: 'user',
        status: 'active',
        depositBalance: 200,
        winningBalance: 2450,
        totalKills: 412,
        matchesPlayed: 58,
        matchesWon: 29,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: 'user_blaze',
        email: 'blaze@ffbattle.gg',
        phone: '9988776655',
        username: 'BlazeHunter',
        ffUid: '891047219',
        ffIgn: 'BLAZE・OP',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Blaze&backgroundColor=f59e0b',
        role: 'user',
        status: 'active',
        depositBalance: 150,
        winningBalance: 1200,
        totalKills: 330,
        matchesPlayed: 40,
        matchesWon: 15,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      }
    ],
    tournaments: [
      {
        id: 't_bermuda_mega_01',
        title: 'Bermuda Grand Battle Royale #402',
        bannerUrl: '/src/assets/images/ff_tournament_hero_1793320526416.jpg',
        mode: 'Battle Royale',
        map: 'Bermuda',
        matchType: 'Paid Entry',
        entryFee: 50,
        prizePool: 2400,
        prizeBreakdown: {
          rank1: 1000,
          rank2: 600,
          rank3: 300,
          perKill: 20,
        },
        maxSlots: 48,
        slotsFilled: 38,
        slots: [
          {
            slotNumber: 1,
            userId: 'user_viper',
            username: 'ViperStriker_99',
            ffUid: '784920152',
            teamName: 'Team Viper',
            registeredAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            slotNumber: 2,
            userId: 'user_apex',
            username: 'ApexPredator',
            ffUid: '629401732',
            teamName: 'Apex Legion',
            registeredAt: new Date(Date.now() - 3500000).toISOString(),
          },
          {
            slotNumber: 3,
            userId: 'user_blaze',
            username: 'BlazeHunter',
            ffUid: '891047219',
            teamName: 'Blaze Squad',
            registeredAt: new Date(Date.now() - 3400000).toISOString(),
          }
        ],
        matchTime: new Date(Date.now() + 45 * 60000).toISOString(), // 45 mins later
        status: 'upcoming',
        rules: [
          'Emulators strictly banned. Mobile devices only.',
          'Custom Room ID and Password will be provided 15 minutes before the match.',
          'Teaming with other squads will result in immediate disqualification and account ban.',
          'Hackers or script users will have their wallet balances permanently frozen.',
          'Screenshots of winning match results must be preserved for dispute resolution.'
        ],
        roomId: '849201',
        roomPass: '7788',
        roomRevealed: false,
        version: 'FF OB44',
        resultsDeclared: false,
      },
      {
        id: 't_free_clash_02',
        title: 'Clash Squad Daily Free Cup #109',
        bannerUrl: '/src/assets/images/ff_clash_squad_1793320529086.jpg',
        mode: 'Clash Squad',
        map: 'Bermuda',
        matchType: 'Free Entry',
        entryFee: 0,
        prizePool: 500,
        prizeBreakdown: {
          rank1: 300,
          rank2: 200,
          perKill: 0,
        },
        maxSlots: 8,
        slotsFilled: 7,
        slots: [
          {
            slotNumber: 1,
            userId: 'user_apex',
            username: 'ApexPredator',
            ffUid: '629401732',
            registeredAt: new Date(Date.now() - 7200000).toISOString(),
          }
        ],
        matchTime: new Date(Date.now() + 15 * 60000).toISOString(), // starts in 15 mins!
        status: 'upcoming',
        rules: [
          '100% Free Entry for all registered gamers.',
          'Room details unlocked 10 minutes prior to match.',
          'Best of 7 rounds in Clash Squad.',
          'Character skill allowed, Gun attributes disabled.'
        ],
        roomId: '901248',
        roomPass: '5566',
        roomRevealed: true, // revealed because it starts soon
        version: 'FF OB44',
        resultsDeclared: false,
      },
      {
        id: 't_purgatory_duo_03',
        title: 'Purgatory Duo Tactical Showdown #88',
        bannerUrl: '/src/assets/images/ff_purgatory_map_1793320527659.jpg',
        mode: 'Duo',
        map: 'Purgatory',
        matchType: 'Paid Entry',
        entryFee: 30,
        prizePool: 1500,
        prizeBreakdown: {
          rank1: 800,
          rank2: 400,
          rank3: 200,
          perKill: 10,
        },
        maxSlots: 24,
        slotsFilled: 24,
        slots: [
          {
            slotNumber: 1,
            userId: 'user_viper',
            username: 'ViperStriker_99',
            ffUid: '784920152',
            teamName: 'Viper Duo',
            registeredAt: new Date(Date.now() - 86400000).toISOString(),
          }
        ],
        matchTime: new Date(Date.now() - 10 * 60000).toISOString(), // started 10m ago
        status: 'live',
        rules: [
          'Duo match. Only 2 players per registered slot.',
          'Airdrop weapons allowed.',
          'Stream sniping will lead to tournament forfeit.'
        ],
        roomId: '739211',
        roomPass: '9900',
        roomRevealed: true,
        version: 'FF OB44',
        resultsDeclared: false,
      },
      {
        id: 't_kalahari_highroller_04',
        title: 'Kalahari High Roller Elite Squad #15',
        bannerUrl: '/src/assets/images/ff_tournament_hero_1793320526416.jpg',
        mode: 'Squad',
        map: 'Kalahari',
        matchType: 'High Roller',
        entryFee: 100,
        prizePool: 5000,
        prizeBreakdown: {
          rank1: 2500,
          rank2: 1500,
          rank3: 600,
          perKill: 25,
        },
        maxSlots: 12,
        slotsFilled: 10,
        slots: [],
        matchTime: new Date(Date.now() + 180 * 60000).toISOString(),
        status: 'upcoming',
        rules: [
          'Full 4-man squad roster required.',
          'High prize pool: ₹25 per kill confirmed.',
          'Room password published 15 minutes before kick-off.'
        ],
        roomId: '661849',
        roomPass: '4411',
        roomRevealed: false,
        version: 'FF OB44',
        resultsDeclared: false,
      },
      {
        id: 't_bermuda_solo_completed_05',
        title: 'Bermuda Solo Blitzkrieg Championship #401',
        bannerUrl: '/src/assets/images/ff_tournament_hero_1793320526416.jpg',
        mode: 'Solo',
        map: 'Bermuda',
        matchType: 'Paid Entry',
        entryFee: 40,
        prizePool: 2000,
        prizeBreakdown: {
          rank1: 900,
          rank2: 500,
          rank3: 200,
          perKill: 15,
        },
        maxSlots: 48,
        slotsFilled: 48,
        slots: [
          {
            slotNumber: 1,
            userId: 'user_apex',
            username: 'ApexPredator',
            ffUid: '629401732',
            registeredAt: new Date(Date.now() - 90000000).toISOString(),
            rank: 1,
            kills: 9,
            prizeWon: 1035, // 900 + 9*15
          },
          {
            slotNumber: 2,
            userId: 'user_viper',
            username: 'ViperStriker_99',
            ffUid: '784920152',
            registeredAt: new Date(Date.now() - 90000000).toISOString(),
            rank: 2,
            kills: 6,
            prizeWon: 590, // 500 + 6*15
          },
          {
            slotNumber: 3,
            userId: 'user_blaze',
            username: 'BlazeHunter',
            ffUid: '891047219',
            registeredAt: new Date(Date.now() - 90000000).toISOString(),
            rank: 3,
            kills: 4,
            prizeWon: 260, // 200 + 4*15
          }
        ],
        matchTime: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        rules: ['Verified match. Result approved by Arena Admin.'],
        roomId: '551829',
        roomPass: '1122',
        roomRevealed: true,
        version: 'FF OB44',
        resultsDeclared: true,
      }
    ],
    transactions: [
      {
        id: 'tx_seed_01',
        userId: 'user_viper',
        amount: 500,
        type: 'DEPOSIT',
        status: 'SUCCESS',
        description: 'UPI Deposit via PhonePe (UTR: 3948201948)',
        upiReference: '3948201948',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'tx_seed_02',
        userId: 'user_viper',
        amount: 40,
        type: 'ENTRY_FEE',
        status: 'SUCCESS',
        description: 'Entry Fee for Bermuda Solo Blitzkrieg #401',
        tournamentId: 't_bermuda_solo_completed_05',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'tx_seed_03',
        userId: 'user_viper',
        amount: 590,
        type: 'PRIZE_WIN',
        status: 'SUCCESS',
        description: 'Tournament Winner Prize - Rank 2 & 6 Kills (Bermuda Solo Blitzkrieg #401)',
        tournamentId: 't_bermuda_solo_completed_05',
        createdAt: new Date(Date.now() - 82000000).toISOString(),
      },
      {
        id: 'tx_seed_04',
        userId: 'user_viper',
        amount: 50,
        type: 'ENTRY_FEE',
        status: 'SUCCESS',
        description: 'Entry Fee for Bermuda Grand Battle Royale #402',
        tournamentId: 't_bermuda_mega_01',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      }
    ],
    withdrawals: [
      {
        id: 'wd_seed_01',
        userId: 'user_apex',
        username: 'ApexPredator',
        amount: 500,
        upiId: 'apex.gamer@okaxis',
        status: 'APPROVED',
        adminRemarks: 'Processed via ICICI IMPS Ref: 894102948',
        requestedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        processedAt: new Date(Date.now() - 46 * 3600000).toISOString(),
      },
      {
        id: 'wd_seed_02',
        userId: 'user_blaze',
        username: 'BlazeHunter',
        amount: 300,
        upiId: 'blaze99@paytm',
        status: 'PENDING',
        requestedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      }
    ],
    notifications: [
      {
        id: 'notif_01',
        userId: 'user_viper',
        title: 'Room ID & Password Revealed!',
        message: 'Room details for Clash Squad Daily Free Cup #109 are now available in your match dashboard.',
        type: 'ROOM_CREDS',
        read: false,
        tournamentId: 't_free_clash_02',
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        id: 'notif_02',
        userId: 'user_viper',
        title: 'Prize Winnings Credited! 🏆',
        message: 'Congratulations! ₹590 has been credited to your Winning Balance for Rank 2 in Bermuda Solo Blitzkrieg #401.',
        type: 'WINNER',
        read: false,
        tournamentId: 't_bermuda_solo_completed_05',
        createdAt: new Date(Date.now() - 82000000).toISOString(),
      },
      {
        id: 'notif_03',
        userId: 'all',
        title: 'Season 14 Tournament Pass is LIVE',
        message: 'Welcome to FF BATTLE ARENA! Play official Free Fire custom room tournaments, climb the leaderboards, and withdraw real cash prizes instantly via UPI.',
        type: 'SYSTEM',
        read: true,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      }
    ],
    announcements: [
      {
        id: 'ann_01',
        title: '🔥 Season 14 Grand Championship Announced',
        content: 'Registration for the ₹50,000 Mega Championship begins this weekend. Top 12 squads will qualify for the live-streamed grand finals.',
        badge: 'MAJOR EVENT',
        date: 'Today',
        active: true,
      },
      {
        id: 'ann_02',
        title: '⚡ Instant UPI Withdrawals Available 24/7',
        content: 'Winnings are verified and credited immediately after match admin review. Minimum withdrawal is ₹100 with 0% processing fee.',
        badge: 'WALLET UPDATE',
        date: 'Active',
        active: true,
      },
      {
        id: 'ann_03',
        title: '🛡️ Zero Tolerance Anti-Cheat Notice',
        content: 'All players must record screen during tournament matches. Any third-party configs, panel hacks, or aimbot scripts will lead to permanent hardware bans.',
        badge: 'FAIR PLAY',
        date: 'Notice',
        active: true,
      }
    ]
  };
}

// Database helper functions
function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database, falling back to default:', err);
    return getInitialDatabase();
  }
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// Helper: resolve active user from request header
function getAuthUser(req: express.Request, db: DatabaseSchema): User | null {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return null;
  return db.users.find(u => u.id === userId) || null;
}

// ======================== API ROUTES ========================

// 1. AUTHENTICATION & PROFILES
app.post('/api/auth/send-otp', (req, res) => {
  const { identifier } = req.body; // phone or email
  if (!identifier) {
    return res.status(400).json({ error: 'Mobile number or email is required' });
  }

  // Realistic mock OTP logic: always 778899 for seamless instant verification
  return res.json({
    success: true,
    message: `OTP sent successfully to ${identifier}`,
    mockOtp: '778899', // displayed for instant test convenience
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { identifier, otp, username, ffUid } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Phone or email is required' });
  }
  if (!otp || otp !== '778899') {
    return res.status(400).json({ error: 'Invalid or expired OTP. Please enter 778899' });
  }

  const db = loadDatabase();
  const isEmail = identifier.includes('@');
  let user = db.users.find(u => isEmail ? u.email.toLowerCase() === identifier.toLowerCase() : u.phone === identifier);

  if (!user) {
    // Register new user
    const finalUsername = username?.trim() || `FF_Warrior_${Math.floor(1000 + Math.random() * 9000)}`;
    const finalFfUid = ffUid?.trim() || `${Math.floor(100000000 + Math.random() * 900000000)}`;

    user = {
      id: `user_${Date.now()}`,
      email: isEmail ? identifier : `${identifier}@ffmobile.user`,
      phone: isEmail ? '9198765432' : identifier,
      username: finalUsername,
      ffUid: finalFfUid,
      ffIgn: finalUsername,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${finalUsername}&backgroundColor=b91c1c`,
      role: 'user',
      status: 'active',
      depositBalance: 100, // ₹100 Welcome Joining Bonus!
      winningBalance: 0,
      totalKills: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);

    // Welcome Transaction
    db.transactions.push({
      id: `tx_${Date.now()}`,
      userId: user.id,
      amount: 100,
      type: 'DEPOSIT',
      status: 'SUCCESS',
      description: 'Welcome Bonus Credited to Wallet',
      createdAt: new Date().toISOString(),
    });

    // Welcome Notification
    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Welcome Bonus ₹100 Added! 🎁',
      message: '₹100 joining bonus credited to your wallet. Join upcoming Free Fire tournaments now!',
      type: 'WALLET',
      read: false,
      createdAt: new Date().toISOString(),
    });

    saveDatabase(db);
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'This account has been suspended due to fair play violations.' });
  }

  return res.json({ success: true, user });
});

app.post('/api/auth/quick-switch', (req, res) => {
  const { role } = req.body; // 'admin' | 'user'
  const db = loadDatabase();
  const target = db.users.find(u => u.role === (role === 'admin' ? 'admin' : 'user'));
  if (!target) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  return res.json({ success: true, user: target });
});

app.get('/api/auth/me', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (!user) {
    // Default fallback to demo gamer if not provided
    return res.json({ user: db.users[1] || db.users[0] });
  }
  return res.json({ user });
});

app.put('/api/auth/profile', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { username, ffUid, ffIgn, avatar } = req.body;
  if (username) user.username = username.trim();
  if (ffUid) {
    // Validate Free Fire UID: must be 8-11 digits
    if (!/^\d{8,11}$/.test(ffUid.trim())) {
      return res.status(400).json({ error: 'Invalid Free Fire UID. It must be 8 to 11 digits.' });
    }
    user.ffUid = ffUid.trim();
  }
  if (ffIgn) user.ffIgn = ffIgn.trim();
  if (avatar) user.avatar = avatar;

  saveDatabase(db);
  return res.json({ success: true, user });
});

// 2. TOURNAMENT SYSTEM
app.get('/api/tournaments', (req, res) => {
  const db = loadDatabase();
  const { status, mode, feeType, map } = req.query;

  let list = db.tournaments;
  if (status && status !== 'all') {
    list = list.filter(t => t.status === status);
  }
  if (mode && mode !== 'all') {
    list = list.filter(t => t.mode.toLowerCase() === (mode as string).toLowerCase());
  }
  if (map && map !== 'all') {
    list = list.filter(t => t.map.toLowerCase() === (map as string).toLowerCase());
  }
  if (feeType === 'free') {
    list = list.filter(t => t.entryFee === 0);
  } else if (feeType === 'paid') {
    list = list.filter(t => t.entryFee > 0);
  }

  // Sanitize room credentials for users who haven't registered
  const user = getAuthUser(req, db);
  const sanitized = list.map(t => {
    const isRegistered = user ? t.slots.some(s => s.userId === user.id) : false;
    const canSeeRoom = (user?.role === 'admin') || (isRegistered && t.roomRevealed);
    return {
      ...t,
      roomId: canSeeRoom ? t.roomId : undefined,
      roomPass: canSeeRoom ? t.roomPass : undefined,
      isUserRegistered: isRegistered,
      userSlot: isRegistered ? t.slots.find(s => s.userId === user?.id)?.slotNumber : undefined,
    };
  });

  return res.json({ tournaments: sanitized });
});

app.get('/api/tournaments/:id', (req, res) => {
  const db = loadDatabase();
  const tournament = db.tournaments.find(t => t.id === req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

  const user = getAuthUser(req, db);
  const isRegistered = user ? tournament.slots.some(s => s.userId === user.id) : false;
  const canSeeRoom = (user?.role === 'admin') || (isRegistered && tournament.roomRevealed);

  return res.json({
    tournament: {
      ...tournament,
      roomId: canSeeRoom ? tournament.roomId : undefined,
      roomPass: canSeeRoom ? tournament.roomPass : undefined,
      isUserRegistered: isRegistered,
      userSlot: isRegistered ? tournament.slots.find(s => s.userId === user?.id)?.slotNumber : undefined,
    }
  });
});

// Join Tournament (With atomic deduction and slot allocation)
app.post('/api/tournaments/:id/join', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (!user) return res.status(401).json({ error: 'Please log in to join tournaments' });

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Your account is suspended' });
  }

  const tournament = db.tournaments.find(t => t.id === req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

  if (tournament.status !== 'upcoming') {
    return res.status(400).json({ error: 'Registration is closed for this tournament.' });
  }

  if (tournament.slotsFilled >= tournament.maxSlots) {
    return res.status(400).json({ error: 'Tournament slots are completely full.' });
  }

  // Check if player is already registered
  const existing = tournament.slots.find(s => s.userId === user.id);
  if (existing) {
    return res.status(400).json({ error: `You are already registered in Slot #${existing.slotNumber}` });
  }

  // Free Fire UID validation
  const { ffUid, teamName } = req.body;
  const effectiveUid = (ffUid || user.ffUid || '').trim();
  if (!effectiveUid || !/^\d{8,11}$/.test(effectiveUid)) {
    return res.status(400).json({ error: 'A valid 8-11 digit Free Fire Player UID is required to register.' });
  }
  // Auto-update user's UID if changed
  if (user.ffUid !== effectiveUid) {
    user.ffUid = effectiveUid;
  }

  // Entry fee check
  const fee = tournament.entryFee;
  const totalBalance = user.depositBalance + user.winningBalance;

  if (fee > 0 && totalBalance < fee) {
    return res.status(400).json({
      error: `Insufficient wallet balance. Entry fee is ₹${fee}, but your balance is ₹${totalBalance}. Please add funds to your wallet.`,
      needsDeposit: true,
      amountNeeded: fee - totalBalance,
    });
  }

  // Deduct fee: first from depositBalance, then from winningBalance
  if (fee > 0) {
    if (user.depositBalance >= fee) {
      user.depositBalance -= fee;
    } else {
      const remainder = fee - user.depositBalance;
      user.depositBalance = 0;
      user.winningBalance -= remainder;
    }

    db.transactions.push({
      id: `tx_${Date.now()}_fee`,
      userId: user.id,
      amount: fee,
      type: 'ENTRY_FEE',
      status: 'SUCCESS',
      description: `Entry fee for ${tournament.title}`,
      tournamentId: tournament.id,
      createdAt: new Date().toISOString(),
    });
  }

  // Find next lowest available slot number
  const usedSlots = new Set(tournament.slots.map(s => s.slotNumber));
  let allocatedSlot = 1;
  while (usedSlots.has(allocatedSlot) && allocatedSlot <= tournament.maxSlots) {
    allocatedSlot++;
  }

  tournament.slots.push({
    slotNumber: allocatedSlot,
    userId: user.id,
    username: user.username,
    ffUid: effectiveUid,
    teamName: teamName?.trim() || undefined,
    registeredAt: new Date().toISOString(),
  });
  tournament.slotsFilled = tournament.slots.length;
  user.matchesPlayed = (user.matchesPlayed || 0) + 1;

  // Add confirmation notification
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: user.id,
    title: 'Slot Confirmed! 🎮',
    message: `You have successfully joined ${tournament.title}. Your assigned Slot is #${allocatedSlot}. Room ID will be shared before match start.`,
    type: 'MATCH_START',
    read: false,
    tournamentId: tournament.id,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  return res.json({
    success: true,
    message: `Successfully booked Slot #${allocatedSlot}!`,
    slotNumber: allocatedSlot,
    tournament,
    user,
  });
});

// Leave / Cancel Registration
app.post('/api/tournaments/:id/leave', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const tournament = db.tournaments.find(t => t.id === req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

  if (tournament.status !== 'upcoming') {
    return res.status(400).json({ error: 'Cannot cancel registration once match is live or completed.' });
  }

  const slotIndex = tournament.slots.findIndex(s => s.userId === user.id);
  if (slotIndex === -1) {
    return res.status(400).json({ error: 'You are not registered in this tournament.' });
  }

  tournament.slots.splice(slotIndex, 1);
  tournament.slotsFilled = tournament.slots.length;

  // Refund entry fee if paid
  if (tournament.entryFee > 0) {
    user.depositBalance += tournament.entryFee;
    db.transactions.push({
      id: `tx_${Date.now()}_refund`,
      userId: user.id,
      amount: tournament.entryFee,
      type: 'REFUND',
      status: 'SUCCESS',
      description: `Refund for leaving ${tournament.title}`,
      tournamentId: tournament.id,
      createdAt: new Date().toISOString(),
    });
  }

  saveDatabase(db);
  return res.json({ success: true, message: 'Tournament registration cancelled and fee refunded.', user });
});

// 3. WALLET SYSTEM (UPI Deposit, Withdrawals, History)
app.get('/api/wallet', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userTransactions = db.transactions
    .filter(t => t.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const userWithdrawals = db.withdrawals
    .filter(w => w.userId === user.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  return res.json({
    depositBalance: user.depositBalance,
    winningBalance: user.winningBalance,
    totalBalance: user.depositBalance + user.winningBalance,
    transactions: userTransactions,
    withdrawals: userWithdrawals,
  });
});

// Deposit Money (UPI Payment Simulation with verification)
app.post('/api/wallet/deposit', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, upiReference, paymentMethod } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount < 10) {
    return res.status(400).json({ error: 'Minimum deposit amount is ₹10.' });
  }
  if (numAmount > 50000) {
    return res.status(400).json({ error: 'Maximum deposit per transaction is ₹50,000.' });
  }

  const refId = upiReference?.trim() || `UPI${Date.now().toString().slice(-8)}`;

  // Credit deposit balance
  user.depositBalance += numAmount;

  const transaction: Transaction = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    amount: numAmount,
    type: 'DEPOSIT',
    status: 'SUCCESS',
    description: `UPI Deposit via ${paymentMethod || 'UPI QR'} (Ref: ${refId})`,
    upiReference: refId,
    createdAt: new Date().toISOString(),
  };
  db.transactions.push(transaction);

  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: user.id,
    title: 'Deposit Successful! 💳',
    message: `₹${numAmount} deposited successfully into your gaming wallet. Ref: ${refId}`,
    type: 'WALLET',
    read: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  return res.json({
    success: true,
    message: `₹${numAmount} credited to wallet!`,
    transaction,
    newBalance: user.depositBalance + user.winningBalance,
    user,
  });
});

// Request Withdrawal (From Winning Balance Only - Anti-Fraud Rule)
app.post('/api/wallet/withdraw', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { amount, upiId, bankAccount } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount < 100) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is ₹100.' });
  }

  if (numAmount > 50000) {
    return res.status(400).json({ error: 'Maximum withdrawal limit per transaction is ₹50,000.' });
  }

  if (numAmount > user.winningBalance) {
    return res.status(400).json({
      error: `Insufficient winning balance. You have ₹${user.winningBalance} in winnings. Only winnings can be withdrawn directly.`,
    });
  }

  if (!upiId && !bankAccount) {
    return res.status(400).json({ error: 'Please provide a valid UPI ID (e.g. mobile@upi) or Bank Details.' });
  }

  // Deduct from winning balance immediately into pending escrow
  user.winningBalance -= numAmount;

  const withdrawalId = `wd_${Date.now()}`;
  const withdrawal: WithdrawalRequest = {
    id: withdrawalId,
    userId: user.id,
    username: user.username,
    amount: numAmount,
    upiId: upiId?.trim() || bankAccount?.trim() || 'N/A',
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
  };

  db.withdrawals.push(withdrawal);

  db.transactions.push({
    id: `tx_${Date.now()}`,
    userId: user.id,
    amount: numAmount,
    type: 'WITHDRAWAL',
    status: 'PENDING',
    description: `Withdrawal request of ₹${numAmount} to ${withdrawal.upiId}`,
    createdAt: new Date().toISOString(),
  });

  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: user.id,
    title: 'Withdrawal Request Submitted',
    message: `Your withdrawal of ₹${numAmount} to ${withdrawal.upiId} has been submitted for admin verification.`,
    type: 'WALLET',
    read: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  return res.json({
    success: true,
    message: `Withdrawal request for ₹${numAmount} placed successfully!`,
    withdrawal,
    user,
  });
});

// 4. LEADERBOARD & RECENT WINNERS
app.get('/api/leaderboard', (req, res) => {
  const db = loadDatabase();

  const players: LeaderboardPlayer[] = db.users
    .filter(u => u.role !== 'admin')
    .map(u => {
      const winRate = u.matchesPlayed > 0 ? Math.round((u.matchesWon / u.matchesPlayed) * 100) : 0;
      let tier: LeaderboardPlayer['tier'] = 'Diamond';
      if (u.totalKills > 300) tier = 'Grandmaster';
      else if (u.totalKills > 150) tier = 'Master';
      else if (u.totalKills > 50) tier = 'Heroic';

      return {
        rank: 0,
        userId: u.id,
        username: u.username,
        ffUid: u.ffUid,
        avatar: u.avatar,
        totalWinnings: u.winningBalance,
        totalKills: u.totalKills || 0,
        matchesWon: u.matchesWon || 0,
        winRate,
        tier,
      };
    })
    .sort((a, b) => b.totalWinnings - a.totalWinnings || b.totalKills - a.totalKills)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  return res.json({ leaderboard: players });
});

app.get('/api/winners/recent', (req, res) => {
  const db = loadDatabase();
  const completed = db.tournaments.filter(t => t.status === 'completed' && t.resultsDeclared);
  const recentWinners = completed.flatMap(t => {
    return t.slots
      .filter(s => s.rank && s.rank <= 3)
      .map(s => {
        const user = db.users.find(u => u.id === s.userId);
        return {
          tournamentId: t.id,
          tournamentTitle: t.title,
          map: t.map,
          mode: t.mode,
          rank: s.rank,
          userId: s.userId,
          username: s.username,
          avatar: user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${s.username}&backgroundColor=b91c1c`,
          ffUid: s.ffUid,
          kills: s.kills || 0,
          prizeWon: s.prizeWon || 0,
          matchDate: t.matchTime,
        };
      });
  }).sort((a, b) => (a.rank || 0) - (b.rank || 0));

  return res.json({ winners: recentWinners });
});

// 5. ANNOUNCEMENTS & NOTIFICATIONS
app.get('/api/announcements', (req, res) => {
  const db = loadDatabase();
  return res.json({ announcements: db.announcements.filter(a => a.active) });
});

app.get('/api/notifications', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const list = db.notifications
    .filter(n => n.userId === user.id || n.userId === 'all')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({ notifications: list });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const db = loadDatabase();
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  saveDatabase(db);
  return res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  if (user) {
    db.notifications.forEach(n => {
      if (n.userId === user.id || n.userId === 'all') n.read = true;
    });
    saveDatabase(db);
  }
  return res.json({ success: true });
});

// ======================== ADMIN PANEL ROUTES ========================

// Admin authentication middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const db = loadDatabase();
  const user = getAuthUser(req, db);
  // Also support secret admin header for testing
  const adminSecret = req.headers['x-admin-key'];
  if (adminSecret === 'FF_ADMIN_SECRET_2026' || (user && user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Admin credentials required' });
}

// Admin Overview Metrics
app.get('/api/admin/overview', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const totalUsers = db.users.length;
  const totalTournaments = db.tournaments.length;
  const activeMatches = db.tournaments.filter(t => t.status === 'live' || t.status === 'upcoming').length;
  const completedMatches = db.tournaments.filter(t => t.status === 'completed').length;
  const pendingWithdrawals = db.withdrawals.filter(w => w.status === 'PENDING').length;
  const totalPrizeDistributed = db.transactions
    .filter(t => t.type === 'PRIZE_WIN' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = db.transactions
    .filter(t => t.type === 'ENTRY_FEE' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  return res.json({
    totalUsers,
    totalTournaments,
    activeMatches,
    completedMatches,
    pendingWithdrawals,
    totalPrizeDistributed,
    totalRevenue,
  });
});

// Admin User Management
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const db = loadDatabase();
  return res.json({ users: db.users });
});

app.post('/api/admin/users/:id/toggle-block', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Cannot block administrator account' });

  user.status = user.status === 'active' ? 'blocked' : 'active';
  saveDatabase(db);
  return res.json({ success: true, user });
});

// Admin Tournament Management
app.post('/api/admin/tournaments', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const {
    title,
    mode,
    map,
    matchType,
    entryFee,
    prizePool,
    maxSlots,
    matchTime,
    rules,
    roomId,
    roomPass,
    rank1Prize,
    rank2Prize,
    rank3Prize,
    perKillPrize,
  } = req.body;

  if (!title || !mode || !map || maxSlots === undefined || !matchTime) {
    return res.status(400).json({ error: 'Please provide all required tournament fields' });
  }

  // Choose banner based on map or mode
  let bannerUrl = '/src/assets/images/ff_tournament_hero_1793320526416.jpg';
  if (map === 'Purgatory') {
    bannerUrl = '/src/assets/images/ff_purgatory_map_1793320527659.jpg';
  } else if (mode === 'Clash Squad') {
    bannerUrl = '/src/assets/images/ff_clash_squad_1793320529086.jpg';
  }

  const newTournament: Tournament = {
    id: `t_${Date.now()}`,
    title: title.trim(),
    bannerUrl,
    mode,
    map,
    matchType: matchType || (Number(entryFee) === 0 ? 'Free Entry' : 'Paid Entry'),
    entryFee: Number(entryFee) || 0,
    prizePool: Number(prizePool) >= 10 ? Number(prizePool) : 10,
    prizeBreakdown: {
      rank1: Number(rank1Prize) || Math.floor((Number(prizePool) >= 10 ? Number(prizePool) : 10) * 0.5),
      rank2: rank2Prize ? Number(rank2Prize) : Math.floor((Number(prizePool) >= 10 ? Number(prizePool) : 10) * 0.3),
      rank3: rank3Prize ? Number(rank3Prize) : Math.floor((Number(prizePool) >= 10 ? Number(prizePool) : 10) * 0.15),
      perKill: Number(perKillPrize) || 0,
    },
    maxSlots: Number(maxSlots),
    slotsFilled: 0,
    slots: [],
    matchTime: new Date(matchTime).toISOString(),
    status: 'upcoming',
    rules: rules && rules.length ? rules : [
      'Mobile devices only. No emulators or external controllers.',
      'Room ID and password will be displayed 15 minutes before the match starts.',
      'Fair play rules enforced. Any illegal teaming or cheating will result in a permanent ban.',
    ],
    roomId: roomId || '',
    roomPass: roomPass || '',
    roomRevealed: false,
    version: 'FF OB44',
    resultsDeclared: false,
  };

  db.tournaments.unshift(newTournament);

  // Broadcast notification about new tournament
  db.notifications.push({
    id: `notif_${Date.now()}`,
    userId: 'all',
    title: `New Tournament: ${newTournament.title}!`,
    message: `${newTournament.mode} on ${newTournament.map} with ₹${newTournament.prizePool} Prize Pool is open for registration!`,
    type: 'SYSTEM',
    read: false,
    tournamentId: newTournament.id,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return res.json({ success: true, tournament: newTournament });
});

app.put('/api/admin/tournaments/:id', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const tournament = db.tournaments.find(t => t.id === req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

  const {
    title,
    status,
    roomId,
    roomPass,
    roomRevealed,
    matchTime,
    entryFee,
    prizePool,
  } = req.body;

  if (title) tournament.title = title;
  if (status) tournament.status = status;
  if (roomId !== undefined) tournament.roomId = roomId;
  if (roomPass !== undefined) tournament.roomPass = roomPass;
  if (roomRevealed !== undefined) tournament.roomRevealed = Boolean(roomRevealed);
  if (matchTime) tournament.matchTime = new Date(matchTime).toISOString();
  if (entryFee !== undefined) tournament.entryFee = Number(entryFee);
  if (prizePool !== undefined) tournament.prizePool = Number(prizePool);

  // If Room ID & Password is now revealed or updated, alert registered players!
  if (tournament.roomRevealed && tournament.roomId) {
    tournament.slots.forEach(slot => {
      db.notifications.push({
        id: `notif_room_${Date.now()}_${slot.slotNumber}`,
        userId: slot.userId,
        title: `Room ID Released for ${tournament.title}!`,
        message: `Room ID: ${tournament.roomId} | Password: ${tournament.roomPass || 'None'}. Join lobby now!`,
        type: 'ROOM_CREDS',
        read: false,
        tournamentId: tournament.id,
        createdAt: new Date().toISOString(),
      });
    });
  }

  saveDatabase(db);
  return res.json({ success: true, tournament });
});

app.delete('/api/admin/tournaments/:id', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const idx = db.tournaments.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Tournament not found' });

  const tournament = db.tournaments[idx];

  // Auto-refund all registered users if paid
  if (tournament.entryFee > 0 && tournament.slots.length > 0) {
    tournament.slots.forEach(slot => {
      const user = db.users.find(u => u.id === slot.userId);
      if (user) {
        user.depositBalance += tournament.entryFee;
        db.transactions.push({
          id: `tx_${Date.now()}_refund_${slot.slotNumber}`,
          userId: user.id,
          amount: tournament.entryFee,
          type: 'REFUND',
          status: 'SUCCESS',
          description: `Refund: Tournament "${tournament.title}" was cancelled by Admin.`,
          tournamentId: tournament.id,
          createdAt: new Date().toISOString(),
        });
      }
    });
  }

  db.tournaments.splice(idx, 1);
  saveDatabase(db);
  return res.json({ success: true, message: 'Tournament deleted and registered fees refunded.' });
});

// Admin Upload Match Results & Distribute Prizes
app.post('/api/admin/tournaments/:id/results', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const tournament = db.tournaments.find(t => t.id === req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

  const { results } = req.body; // Array of { slotNumber: number, rank: number, kills: number }

  if (!Array.isArray(results)) {
    return res.status(400).json({ error: 'Results must be an array of player outcomes' });
  }

  // Update slots with ranks, kills, and calculate prize won
  const breakdown = tournament.prizeBreakdown;

  results.forEach(resItem => {
    const slot = tournament.slots.find(s => s.slotNumber === resItem.slotNumber);
    if (slot) {
      slot.rank = Number(resItem.rank);
      slot.kills = Number(resItem.kills) || 0;

      let prize = 0;
      if (slot.rank === 1) prize += breakdown.rank1;
      else if (slot.rank === 2) prize += (breakdown.rank2 || 0);
      else if (slot.rank === 3) prize += (breakdown.rank3 || 0);

      prize += slot.kills * (breakdown.perKill || 0);
      slot.prizeWon = prize;

      // Update user stats
      const user = db.users.find(u => u.id === slot.userId);
      if (user) {
        user.totalKills = (user.totalKills || 0) + slot.kills;
        if (slot.rank === 1) {
          user.matchesWon = (user.matchesWon || 0) + 1;
        }
      }
    }
  });

  tournament.resultsDeclared = true;
  tournament.status = 'completed';

  saveDatabase(db);
  return res.json({ success: true, message: 'Match results uploaded successfully.', tournament });
});

app.post('/api/admin/tournaments/:id/distribute-prizes', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const tournament = db.tournaments.find(t => t.id === req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

  if (!tournament.resultsDeclared) {
    return res.status(400).json({ error: 'Please upload match results first before distributing prize pool.' });
  }

  let totalPaid = 0;
  let winnersCount = 0;

  tournament.slots.forEach(slot => {
    if (slot.prizeWon && slot.prizeWon > 0) {
      const user = db.users.find(u => u.id === slot.userId);
      if (user) {
        user.winningBalance += slot.prizeWon;
        totalPaid += slot.prizeWon;
        winnersCount++;

        // Transaction log
        db.transactions.push({
          id: `tx_${Date.now()}_win_${slot.slotNumber}`,
          userId: user.id,
          amount: slot.prizeWon,
          type: 'PRIZE_WIN',
          status: 'SUCCESS',
          description: `Won ₹${slot.prizeWon} in ${tournament.title} (Rank ${slot.rank}, ${slot.kills} Kills)`,
          tournamentId: tournament.id,
          createdAt: new Date().toISOString(),
        });

        // Winning notification
        db.notifications.push({
          id: `notif_${Date.now()}_win_${slot.slotNumber}`,
          userId: user.id,
          title: 'Victory! Tournament Prize Credited 🏆',
          message: `Congratulations! You placed Rank #${slot.rank} with ${slot.kills} kills in ${tournament.title}. ₹${slot.prizeWon} credited to your Winning Balance.`,
          type: 'WINNER',
          read: false,
          tournamentId: tournament.id,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  saveDatabase(db);
  return res.json({
    success: true,
    message: `Distributed ₹${totalPaid} to ${winnersCount} players' wallets!`,
    totalPaid,
    winnersCount,
  });
});

// Admin Manage Withdrawals
app.get('/api/admin/withdrawals', requireAdmin, (req, res) => {
  const db = loadDatabase();
  return res.json({ withdrawals: db.withdrawals.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()) });
});

app.post('/api/admin/withdrawals/:id/action', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const withdrawal = db.withdrawals.find(w => w.id === req.params.id);
  if (!withdrawal) return res.status(404).json({ error: 'Withdrawal request not found' });

  const { action, remarks } = req.body; // action: 'APPROVE' | 'REJECT'

  if (withdrawal.status !== 'PENDING') {
    return res.status(400).json({ error: 'This withdrawal request has already been processed.' });
  }

  const user = db.users.find(u => u.id === withdrawal.userId);

  if (action === 'APPROVE') {
    withdrawal.status = 'APPROVED';
    withdrawal.adminRemarks = remarks?.trim() || `Processed via UPI Bank Transfer`;
    withdrawal.processedAt = new Date().toISOString();

    // Update pending transaction status
    const tx = db.transactions.find(t => t.userId === withdrawal.userId && t.amount === withdrawal.amount && t.status === 'PENDING');
    if (tx) tx.status = 'SUCCESS';

    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: withdrawal.userId,
      title: 'Withdrawal Approved & Sent! 💸',
      message: `Your withdrawal of ₹${withdrawal.amount} to ${withdrawal.upiId} has been successfully dispatched.`,
      type: 'WALLET',
      read: false,
      createdAt: new Date().toISOString(),
    });
  } else if (action === 'REJECT') {
    withdrawal.status = 'REJECTED';
    withdrawal.adminRemarks = remarks?.trim() || 'Rejected due to invalid UPI ID or suspicious activity';
    withdrawal.processedAt = new Date().toISOString();

    // Refund back to user's winning balance
    if (user) {
      user.winningBalance += withdrawal.amount;
    }

    const tx = db.transactions.find(t => t.userId === withdrawal.userId && t.amount === withdrawal.amount && t.status === 'PENDING');
    if (tx) tx.status = 'REJECTED';

    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId: withdrawal.userId,
      title: 'Withdrawal Rejected - Funds Refunded',
      message: `Your withdrawal of ₹${withdrawal.amount} was rejected: ${withdrawal.adminRemarks}. Amount has been refunded back to your winning wallet.`,
      type: 'WALLET',
      read: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    return res.status(400).json({ error: 'Action must be APPROVE or REJECT' });
  }

  saveDatabase(db);
  return res.json({ success: true, withdrawal });
});

// Admin Broadcast Notification
app.post('/api/admin/broadcast', requireAdmin, (req, res) => {
  const db = loadDatabase();
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const notif: Notification = {
    id: `notif_${Date.now()}`,
    userId: 'all',
    title: title.trim(),
    message: message.trim(),
    type: 'SYSTEM',
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.push(notif);
  saveDatabase(db);
  return res.json({ success: true, notification: notif });
});

// ======================== VITE & STATIC SERVING ========================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FF BATTLE ARENA] Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
