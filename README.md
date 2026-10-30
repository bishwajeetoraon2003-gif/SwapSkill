# SkillSwap – Exchange Skills, Share Knowledge, Grow Together 🔄

SkillSwap is a modern peer-to-peer skill exchange platform that empowers people to teach what they already know and learn new skills from others without monetary payments.

---

## 🌟 Key Features

1. **User Authentication & Instant Testing**:
   - Secure registration, password hashing with `bcryptjs`, and JWT session tokens.
   - **1-Click Demo Profiles Switcher**: Switch immediately between diverse profiles (*Alex Rivera, Sophia Chen, Marcus Vance, Priya Patel, Elena Rostova, David Kim, Clara Dubois, Liam O’Connor*) in the header to evaluate reciprocal matches and swap notifications instantly.

2. **Smart Matching Engine**:
   - **100% Mutual Reciprocal Matches**: Identifies exact win-win pairs (e.g. Alex teaches React and wants Spanish; Sophia teaches Spanish and wants React).
   - **High-Potential Matches**: Identifies members who teach your wishlist skills or are looking to learn what you teach.
   - Highlights the exact skills exchanged and compatibility scores with vibrant animated badges.

3. **Skill Discovery & Search**:
   - Filter by categories (*Development, Design, Languages, Data Science, Music, Photography, Marketing, Business, Writing*).
   - Filter by skill type (*Teaching* vs *Learning*) and proficiency levels (*Beginner*, *Intermediate*, *Advanced*, *Expert*).
   - Real-time search query across names, bios, skill titles, and learning goals.

4. **Skill Management**:
   - Full CRUD capabilities for **"Skills I Can Teach"** (proficiency, experience, description).
   - Full CRUD capabilities for **"Skills I Want to Learn"** (current level, target goals, preferred format).

5. **Swap Request Management**:
   - Send custom swap proposals with preferred format (*1-on-1 Video Call, Screen Share, Async Code Review*) and availability.
   - Accept or decline incoming proposals.
   - Coordinate ongoing exchanges with in-app session and meeting notes.
   - Mark exchanges as completed with a 1-5 star community rating and written testimonial.

6. **Learning Dashboard**:
   - Real-time metrics: Skills Teaching, Skills Learning, Active Exchanges, Pending Proposals, Exchanged Hours, and Trust Rating.
   - Quick action cards for incoming requests and upcoming sessions.

7. **Aesthetics & Responsive Design**:
   - Curated color palette (vibrant emerald and indigo violet with glassmorphic accents).
   - Custom typography using Google Font *Plus Jakarta Sans*.
   - Responsive layouts optimized for desktop, tablet, and mobile browsers.

---

## 🚀 Running Locally

The server is currently running at:
**[http://localhost:3000](http://localhost:3000)**

To run or restart manually:
```bash
npm install
npm start
```

Default test credentials:
- Email: Any demo user (e.g., `alex@example.com`, `sophia@example.com`, `marcus@example.com`)
- Password: `password123`
*(Or use the 1-Click Demo Switcher in the top navigation bar!)*
