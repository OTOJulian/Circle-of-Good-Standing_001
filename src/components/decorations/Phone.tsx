import { useState, useRef, useEffect } from 'react';

interface PhoneProps {
  isExpanded?: boolean;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  previewUrl: string | null; // 30-second preview URL from Spotify
  explanation: string;
}

// Playlist intro text (shown when no song is hovered)
const playlistIntro = `You asked me, "What's the full Mahnoor experience?", and I answered with a joke because this would have been a really long text. I had been adding songs to this playlist since Paris, every time I heard something that aligned with or reminded me my experience with you. I didn't think I'd ever send it to you, it was just something I could listen to when I wanted to revisit certain moments. Music is particularly good at that. But then I realized it was a pretty good answer to your question, and that I didn't have much to lose.`;

// Split long explanations into pages
const MAX_EXPLANATION_CHARS = 500;

function splitExplanationIntoPages(text: string): string[] {
  if (text.length <= MAX_EXPLANATION_CHARS) {
    return [text];
  }

  const pages: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_EXPLANATION_CHARS) {
      pages.push(remaining);
      break;
    }

    // Find a good break point (sentence end) within the limit
    let breakPoint = MAX_EXPLANATION_CHARS;
    const searchStart = Math.min(remaining.length, MAX_EXPLANATION_CHARS);
    const searchEnd = Math.max(0, MAX_EXPLANATION_CHARS - 150);

    // Look backwards from max chars to find sentence end
    for (let i = searchStart; i >= searchEnd; i--) {
      const char = remaining[i];
      if ((char === '.' || char === '!' || char === '?') && remaining[i + 1] === ' ') {
        breakPoint = i + 1;
        break;
      }
    }

    // If no sentence break found, look for word boundary
    if (breakPoint === MAX_EXPLANATION_CHARS) {
      for (let i = MAX_EXPLANATION_CHARS; i >= searchEnd; i--) {
        if (remaining[i] === ' ') {
          breakPoint = i;
          break;
        }
      }
    }

    pages.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }

  return pages;
}

// Playlist data
const playlist = {
  name: "The Full Mahnoor Experience",
  coverImage: "/assets/playlist_cover.JPG",
  spotifyUrl: "https://open.spotify.com/playlist/4ymJN8wYOqoqqiJC38D3Mf",
  songs: [
    {
      id: "1",
      title: "SkeeYee",
      artist: "Sexyy Red",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0238f8e4adcb8668df34ce1660",
      spotifyUrl: "https://open.spotify.com/track/7icwQvajsokotDfM3tefW6",
      previewUrl: null,
      explanation: "Hearing the story about how you broke your arm running to turn off Sexyy Red playing too loud in Oslo was a good introduction to how funny you are.",
    },
    {
      id: "2",
      title: "I'll Try Anything Once",
      artist: "The Strokes",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02f71abcb4d9ba0fbbc62fe867",
      spotifyUrl: "https://open.spotify.com/track/1L0C3xvOtzHSOSZ5T59n0L",
      previewUrl: "https://p.scdn.co/mp3-preview/4a8674088bbd981565c669550709dd1f28b9b02b",
      explanation: "The thought about whether or not to take the risk and meet you in Paris.",
    },
    {
      id: "3",
      title: "The Way You Look Tonight",
      artist: "Tony Bennett",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0231d261a19f6d40775ae820b5",
      spotifyUrl: "https://open.spotify.com/track/7yED4n2U8RR5LKZVmisiev",
      previewUrl: "https://p.scdn.co/mp3-preview/1a21a84edea3296cefd9ac1da2e79e33e66640b0",
      explanation: `The risk paying off. You very literally took my breath away the first moment I saw you walk out of that airbnb. Which is quite serious for an asthmatic. This song played in my head over and over as we walked through Paris after dinner. "Someday, when I'm awfully low, and the world is cold, I will feel a glow just thinking of you, and the way you looked tonight." I just didn't know that "someday" would come so soon.`,
    },
    {
      id: "4",
      title: "Till There Was You",
      artist: "The Beatles",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02608a63ad5b18e99da94a3f73",
      spotifyUrl: "https://open.spotify.com/track/0ESIjVxnDnCDaTPo6sStHm",
      previewUrl: "https://p.scdn.co/mp3-preview/8dd4bf57ce5b104be30c71cc8f407087d7aa0c44",
      explanation: "What played in my head when I shoved my face into a flower at the Bourdelle museum. Literally stopping to smell the roses. Something I know I wouldn't have done if you hadn't been there.",
    },
    {
      id: "5",
      title: "Prototype",
      artist: "Outkast",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0215b62abc4b14254c4ad8621d",
      spotifyUrl: "https://open.spotify.com/track/476BGkZCAmmpw36sI4c5dt",
      previewUrl: "https://p.scdn.co/mp3-preview/b41ec3484604439aac401256142545c35040b02f",
      explanation: "I kept thinking how insane it was that you not only lived up to, but exceeded my expectations. You were warm, funny, brilliant, artistic, and beautiful in a way that (made Paris pale in comparison, made it so I barely noticed the monuments we were walking around) when we passed the Eiffel tower, you covered your eyes, I didn't even notice it.",
    },
    {
      id: "6",
      title: "Everything Happens To Me",
      artist: "Mr Hudson & The Library",
      albumArt: "https://i.scdn.co/image/ab67616d00001e028d0512ca6aca9d4fa6df317a",
      spotifyUrl: "https://open.spotify.com/track/1RraFTMSBiEbDjS3bX7FP6",
      previewUrl: "https://p.scdn.co/mp3-preview/a16b917f869ed5dc07cecc450d2d80867af436f4",
      explanation: "After the first night and second day, it felt like everything that could go wrong, did.",
    },
    {
      id: "7",
      title: "Blame It On The Sun",
      artist: "Stevie Wonder",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02a14b08b9a6616e121df5e8b0",
      spotifyUrl: "https://open.spotify.com/track/65qWooYTj0dq5HzoV6P9Kt",
      previewUrl: "https://p.scdn.co/mp3-preview/7043ac22cacaca658828da1b9068e05bd0fb2e57",
      explanation: "I wanted to blame it on everything but myself. But I ended up feeling insecure because I thought I was letting you down. This led me to say something stupid in a cafe I'd give anything to take back.",
    },
    {
      id: "8",
      title: "What Are You Doing The Rest Of Your Life?",
      artist: "Bill Evans",
      albumArt: "https://i.scdn.co/image/ab67616d00001e021fb1655c7ebec963808be2f9",
      spotifyUrl: "https://open.spotify.com/track/1NwwZ1VpCE1vxM28VayW86",
      previewUrl: "https://p.scdn.co/mp3-preview/99505079325ffd3ac4bda8ce3e807e0112a0208d",
      explanation: `When I told you turn around so I could give you the birthday list gifts, you said, "Are you proposing? Because if you are my answer is no".`,
    },
    {
      id: "9",
      title: "I Know It's Over",
      artist: "The Smiths",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02ada101c2e9e97feb8fae37a9",
      spotifyUrl: "https://open.spotify.com/track/3M2bD9SMYnJIPdrTKUnBd3",
      previewUrl: "https://p.scdn.co/mp3-preview/03d2a368be26cf839f3acc7258ab6b25eef81b94",
      explanation: "The song that played on repeat I walked for hours around Paris the night you left. I was sure it was over. And it barely began.",
    },
    {
      id: "10",
      title: "Trouble",
      artist: "Richard Saunders",
      albumArt: "https://i.scdn.co/image/ab67616d00001e020995328b6390f89b3eb2b27e",
      spotifyUrl: "https://open.spotify.com/track/5N7usY5OYD0sCTNiZZlyQn",
      previewUrl: "https://p.scdn.co/mp3-preview/d17f9845dc277c89e3cbb60b76bd2519c5df3038",
      explanation: "I thought I might never get to talk to you again, then a 7 hour call when I'm back in NY and you're back in Oslo. I'm in trouble now.",
    },
    {
      id: "11",
      title: "What'll I Do?",
      artist: "Nat King Cole Trio",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02fdd261528e3590ac36bb85f0",
      spotifyUrl: "https://open.spotify.com/track/675O3VntvhGApD7h4YQ89G",
      previewUrl: "https://p.scdn.co/mp3-preview/17ca653f58fe74e8464ebebddc0480a9e31d108b",
      explanation: "The elation of the call, leads directly to reality of the distance.",
    },
    {
      id: "12",
      title: "If It's Magic",
      artist: "Stevie Wonder",
      albumArt: "https://i.scdn.co/image/ab67616d00001e022fee61bfec596bb6f5447c50",
      spotifyUrl: "https://open.spotify.com/track/4UBzGxrKBZN0NwJ8vTz8AG",
      previewUrl: "https://p.scdn.co/mp3-preview/09f3130d79645a4bbbb6b805fc71abd9e8356233",
      explanation: "But if it's magic, if it's as rare as I know it is, why can't it work out?",
    },
    {
      id: "13",
      title: "Calling All My Lovelies",
      artist: "Bruno Mars",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02232711f7d66a1e19e89e28c5",
      spotifyUrl: "https://open.spotify.com/track/6ObpR8ek44tvWefQRcSo8K",
      previewUrl: "https://p.scdn.co/mp3-preview/eb7950f593437250a5ac974e9aca2452f92190ab",
      explanation: "Using a bruised ego to get over how often you don't answer calls.",
    },
    {
      id: "14",
      title: "Tell Me Who You Are Today",
      artist: "Beth Gibbons",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0216997b4a53ae6b42a4b803be",
      spotifyUrl: "https://open.spotify.com/track/1tB6SUQaXIUU4CprvNPwsT",
      previewUrl: "https://p.scdn.co/mp3-preview/095044ef5939704652dd2ff881c8287386581d27",
      explanation: "Sometimes an interaction with you can feel like a roll of the dice. I don't always know which version I'm going to get.",
    },
    {
      id: "15",
      title: "I'm A Fool To Want You",
      artist: "Dexter Gordon",
      albumArt: "https://i.scdn.co/image/ab67616d00001e026d5755072aaf2dad1868b182",
      spotifyUrl: "https://open.spotify.com/track/4EaNQXQIuiBlQe5fe5fae6",
      previewUrl: "https://p.scdn.co/mp3-preview/3d35d8100d0b64ff26c7bbeaa306569e1f5a906e",
      explanation: "It can, at times, feel foolish to care this much about someone I have yet to kiss.",
    },
    {
      id: "16",
      title: "Media Vuelta",
      artist: "Eydie Gormé, Los Panchos",
      albumArt: "https://i.scdn.co/image/ab67616d00001e021882bb790ff01387342c9750",
      spotifyUrl: "https://open.spotify.com/track/0LVLuqyQrXViI9OzDIVxbw",
      previewUrl: "https://p.scdn.co/mp3-preview/16712a09d202d8e178d3321fb4d44f4575ee7592",
      explanation: "You said once on our second call and again on our first dinner in Oslo, that it was good that I dated other people, so I could see that the grass isn't greener. A motto I would be forced to adopt when I saw the stories you posted with that guy in Berlin.",
    },
    {
      id: "17",
      title: "Linger (Acoustic Version)",
      artist: "The Cranberries",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02685628de68cfc204f3f8dbd5",
      spotifyUrl: "https://open.spotify.com/track/1nxebACXgKGhpB2DPs3qP0",
      previewUrl: "https://p.scdn.co/mp3-preview/4e1dac72be8b32eb170eeb984c69e7b7ce95371e",
      explanation: "Distracting myself doesn't seem to work. My brain is great finding tiny things that remind me of you.",
    },
    {
      id: "18",
      title: "Time in a Bottle",
      artist: "Jim Croce",
      albumArt: "https://i.scdn.co/image/ab67616d00001e025b7a6cabbcb9fe150966563c",
      spotifyUrl: "https://open.spotify.com/track/7uWFUpGuEfmxYeymkV95jn",
      previewUrl: "https://p.scdn.co/mp3-preview/b5d8d825de94c965b3f20157bbbb3612fceaed47",
      explanation: `"There never seems to be enough time to do the things you want to do once you find them" I thought we'd have 3 nights together in Paris, we had 1. I thought we'd have one more night together in Oslo, you got sick. It's easy to not do or say something in a moment because you think you have more time, but you never have as much as you think.`,
    },
    {
      id: "19",
      title: "Fool Me a Good Night",
      artist: "Labi Siffre",
      albumArt: "https://i.scdn.co/image/ab67616d00001e024f6f29e2eb6055e6451e042e",
      spotifyUrl: "https://open.spotify.com/track/344spUSRUifQy5VSAWw8OI",
      previewUrl: "https://p.scdn.co/mp3-preview/0cf1a59c59f70e0c4bfa14917638fd587f028a4c",
      explanation: "Hope 🤝🏽 Delusion",
    },
    {
      id: "20",
      title: "Do You Ever Think Of Me?",
      artist: "Corinne Bailey Rae",
      albumArt: "https://i.scdn.co/image/ab67616d00001e024a90e81173a3a5ad2e63f1a5",
      spotifyUrl: "https://open.spotify.com/track/4dNcc0IbNYNPTfshVv941Z",
      previewUrl: "https://p.scdn.co/mp3-preview/4ca4dea645a62f01d41b1f256fef50284d81d487",
      explanation: "Wondering what's going on in your mind during some of these extended silences.",
    },
    {
      id: "21",
      title: "Come Back to Earth",
      artist: "Mac Miller",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02175c577a61aa13d4fb4b6534",
      spotifyUrl: "https://open.spotify.com/track/01z2fBGB8Hl3Jd3zXe4IXR",
      previewUrl: null,
      explanation: `The regrets have piled up over 8 months. I regret not kissing you on that first night in Paris. I regret saying that in the cafe. Not calling you sooner instead of waiting until I found the "right" party. Not texting you sooner my first night in Oslo. Calling you avoidant at that bar. Bringing up February on the phone during exams.`,
    },
    {
      id: "22",
      title: "Present Tense",
      artist: "Radiohead",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0245643f5cf119cbc9d2811c22",
      spotifyUrl: "https://open.spotify.com/track/7KHQtpLpoIV3Wfu22YQT8y",
      previewUrl: null,
      explanation: `I saw a clip of from the Last Dance of a guy on the Chicago Bulls staff talking about what made Michael Jordan so special. From his perspective, it wasn't that Michael was particularly more athletic or skilled than the other top players, but instead that he was the most present person you'd ever met. That was his superpower. For those 2 or 3 hours, the past and future, every shot he had taken or was going to take, didn't exist. He was perfectly in that moment, focused on that single shot. I thought about that for a while, considering if there were any moments in my life that I felt anything like that. The relationship to mindfulness is obvious, and surely I've felt echoes of this feeling during particularly focused moments of meditation. And the flow state I associate with athletes is something I've also felt in certain meetings or pitches where I knew I was at the top of my game. But when I scanned over the memories in the past year, something unexpected came up. All the moments I spent with you. It's not that I entered anything close to a flow state brought on by a great performance, quite the opposite actually, you remember how many times I put my foot in my mouth. But despite that, in all those moments with you, sitting across from you at a table, wandering Parisian streets we'd never seen, hearing your voice over the phone, I was completely, utterly, hopelessly, present. Present, in the sense that there wasn't anywhere I'd have rather been, or with anyone I'd have rather been with. Nothing was missing. (I let myself get in my head too much not wanting to ruin what felt like perfect moments. But you can't stay with your head in the clouds. You have to come back to earth.)`,
    },
    {
      id: "23",
      title: "Is This Love",
      artist: "Corinne Bailey Rae",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02e99107cbf556089592b73b50",
      spotifyUrl: "https://open.spotify.com/track/5FvapYqWK6TEuh4csYwQ9O",
      previewUrl: "https://p.scdn.co/mp3-preview/f4215af1a270e5173b7bd05faf173b2e6d74940c",
      explanation: "Definitions are difficult.",
    },
    {
      id: "24",
      title: "Who Knows",
      artist: "Daniel Caesar",
      albumArt: "https://i.scdn.co/image/ab67616d00001e022bad6e56e77d5bef0aa3f2dc",
      spotifyUrl: "https://open.spotify.com/track/6DH13QYXK7lKkYHSU88N48",
      previewUrl: "https://p.scdn.co/mp3-preview/695ea23e689a1816b09a8ac6f08749f0f5c38420",
      explanation: "And outcomes are unpredictable.",
    },
    {
      id: "25",
      title: "True Love Waits (Live in Oslo)",
      artist: "Radiohead",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0205a2f9af5f0eaed4835acf54",
      spotifyUrl: "https://open.spotify.com/track/62SvkbQm1wMS6KZtbtls1V",
      previewUrl: "https://p.scdn.co/mp3-preview/f7fb2f0a7896f669e71f35a6fe7bafdd8e62f7b6",
      explanation: "But some things are worth the wait.",
    },
  ] as Song[],
};

export function Phone({ isExpanded = false }: PhoneProps) {
  const [hoveredSong, setHoveredSong] = useState<Song | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [failedPreviews, setFailedPreviews] = useState<Set<string>>(new Set());
  const [explanationPage, setExplanationPage] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset explanation page when hovered song changes
  useEffect(() => {
    setExplanationPage(0);
  }, [hoveredSong?.id]);

  // Clean up audio when component unmounts or collapses
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when popup closes
  useEffect(() => {
    if (!isExpanded && audioRef.current) {
      audioRef.current.pause();
      setPlayingSongId(null);
      setProgress(0);
    }
  }, [isExpanded]);

  const handlePlayPause = (song: Song, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If no preview or preview has failed, open Spotify
    if (!song.previewUrl || failedPreviews.has(song.id)) {
      window.open(song.spotifyUrl, '_blank');
      return;
    }

    if (playingSongId === song.id) {
      // Pause current song
      audioRef.current?.pause();
      setPlayingSongId(null);
    } else {
      // Play new song
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(song.previewUrl);
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setProgress((audio.currentTime / audio.duration) * 100);
      });

      audio.addEventListener('ended', () => {
        setPlayingSongId(null);
        setProgress(0);
      });

      audio.addEventListener('error', () => {
        // Mark this preview as failed so we don't try again
        setFailedPreviews(prev => new Set(prev).add(song.id));
        setPlayingSongId(null);
      });

      // Set playing state for UI feedback
      setPlayingSongId(song.id);
      setProgress(0);

      audio.play().catch(() => {
        // Mark this preview as failed
        setFailedPreviews(prev => new Set(prev).add(song.id));
        setPlayingSongId(null);
      });
    }
  };

  if (!isExpanded) {
    // Collapsed view - just show the phone image
    return (
      <div className="select-none table-object">
        <img
          src="/assets/phone.png"
          alt="Phone"
          className="w-32 h-auto"
          style={{
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
          }}
          draggable={false}
        />
      </div>
    );
  }

  // Expanded view - Spotify-like playlist with hover explanations
  return (
    <div className="select-none flex gap-6" style={{ maxWidth: '900px' }}>
      {/* Playlist panel */}
      <div
        className="rounded-xl p-5 flex flex-col"
        style={{
          backgroundColor: '#191414',
          width: '400px',
          maxHeight: '500px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Playlist header with cover - hover to show intro */}
        <div
          className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10 cursor-pointer"
          onMouseEnter={() => setHoveredSong(null)}
        >
          <img
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-20 h-20 rounded-lg shadow-lg"
            style={{ objectFit: 'cover' }}
          />
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Playlist</p>
            <h3 className="text-white font-bold text-xl leading-tight">{playlist.name}</h3>
            <p className="text-white/60 text-sm mt-1">{playlist.songs.length} songs</p>
          </div>
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {playlist.songs.map((song, index) => {
            const isPlaying = playingSongId === song.id;
            const isHovered = hoveredSong?.id === song.id;

            return (
              <div
                key={song.id}
                className="relative flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: isPlaying ? 'rgba(29, 185, 84, 0.2)' : isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
                onMouseEnter={() => setHoveredSong(song)}
                onClick={(e) => handlePlayPause(song, e)}
              >
                {/* Track number or play icon */}
                <div className="w-5 flex items-center justify-center">
                  {isHovered || isPlaying ? (
                    <button
                      className="text-white hover:text-[#1DB954] transition-colors"
                      onClick={(e) => handlePlayPause(song, e)}
                    >
                      {failedPreviews.has(song.id) ? (
                        // Spotify icon for failed previews
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1DB954">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      ) : isPlaying ? (
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    failedPreviews.has(song.id) ? (
                      // Show Spotify icon even when not hovered for failed previews
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#1DB954" opacity={0.6}>
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    ) : (
                      <span className="text-white/40 text-sm">{index + 1}</span>
                    )
                  )}
                </div>

                {/* Album art */}
                <img
                  src={song.albumArt}
                  alt={song.title}
                  className="w-10 h-10 rounded"
                  style={{ objectFit: 'cover' }}
                />

                {/* Song info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isPlaying ? 'text-[#1DB954]' : 'text-white'}`}>
                    {song.title}
                  </p>
                  <p className="text-white/60 text-xs truncate">{song.artist}</p>
                </div>

                {/* Open in Spotify icon */}
                <a
                  href={song.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors p-1"
                  onClick={(e) => e.stopPropagation()}
                  title="Open in Spotify"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </a>

                {/* Progress bar for playing song */}
                {isPlaying && (
                  <div
                    className="absolute bottom-0 left-0 h-0.5 rounded-full"
                    style={{
                      backgroundColor: '#1DB954',
                      width: `${progress}%`,
                      transition: 'width 0.1s linear',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Open in Spotify button */}
        <a
          href={playlist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-transform hover:scale-105"
          style={{
            backgroundColor: '#1DB954',
            color: '#000',
          }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path
              fill="currentColor"
              d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
            />
          </svg>
          Open in Spotify
        </a>
      </div>

      {/* Explanation panel */}
      <div
        className="rounded-xl p-6 flex flex-col justify-center relative"
        style={{
          backgroundColor: 'var(--color-paper)',
          width: '350px',
          minHeight: '300px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {hoveredSong ? (
          (() => {
            const pages = splitExplanationIntoPages(hoveredSong.explanation);
            const totalPages = pages.length;
            const currentPage = Math.min(explanationPage, totalPages - 1);

            return (
              <div className="transition-opacity duration-200 flex flex-col h-full">
                <p className="serif text-lg italic mb-3" style={{ color: 'var(--color-ink-faded)' }}>
                  "{hoveredSong.title}"
                </p>
                <p className="serif text-base leading-relaxed flex-1" style={{ color: 'var(--color-ink)' }}>
                  {pages[currentPage]}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-4 pt-2">
                    <button
                      onClick={() => setExplanationPage(p => (p - 1 + totalPages) % totalPages)}
                      className="text-sm px-2 py-1 rounded transition-colors"
                      style={{ color: 'var(--color-ink-faded)' }}
                    >
                      &larr;
                    </button>
                    <span className="serif text-sm" style={{ color: 'var(--color-ink-faded)' }}>
                      {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setExplanationPage(p => (p + 1) % totalPages)}
                      className="text-sm px-2 py-1 rounded transition-colors"
                      style={{ color: 'var(--color-ink-faded)' }}
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <p className="serif text-base leading-relaxed" style={{ color: 'var(--color-ink)' }}>
            {playlistIntro}
          </p>
        )}
      </div>
    </div>
  );
}
