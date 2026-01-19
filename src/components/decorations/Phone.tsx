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

// Playlist data - add your explanations for each song!
const playlist = {
  name: "The Full Mahnoor Experience",
  coverImage: "/assets/playlist_cover.JPG",
  spotifyUrl: "https://open.spotify.com/playlist/4ymJN8wYOqoqqiJC38D3Mf",
  songs: [
    {
      id: "1",
      title: "I'll Try Anything Once",
      artist: "The Strokes",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02f71abcb4d9ba0fbbc62fe867",
      spotifyUrl: "https://open.spotify.com/track/1L0C3xvOtzHSOSZ5T59n0L",
      previewUrl: "https://p.scdn.co/mp3-preview/4a8674088bbd981565c669550709dd1f28b9b02b",
      explanation: "Add your explanation here...",
    },
    {
      id: "2",
      title: "The Way You Look Tonight",
      artist: "Tony Bennett",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0231d261a19f6d40775ae820b5",
      spotifyUrl: "https://open.spotify.com/track/7yED4n2U8RR5LKZVmisiev",
      previewUrl: "https://p.scdn.co/mp3-preview/1a21a84edea3296cefd9ac1da2e79e33e66640b0",
      explanation: "Add your explanation here...",
    },
    {
      id: "3",
      title: "Si tu vois ma mère",
      artist: "The London Film Score Orchestra",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02e0ff38731ac198d052abd0a3",
      spotifyUrl: "https://open.spotify.com/track/0e5GAZbEEWxnBZlxWzQ5sf",
      previewUrl: "https://p.scdn.co/mp3-preview/c41d6cb7078450b1b59cc70c35771c9ac055781a",
      explanation: "Add your explanation here...",
    },
    {
      id: "4",
      title: "Till There Was You",
      artist: "The Beatles",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02608a63ad5b18e99da94a3f73",
      spotifyUrl: "https://open.spotify.com/track/0ESIjVxnDnCDaTPo6sStHm",
      previewUrl: "https://p.scdn.co/mp3-preview/8dd4bf57ce5b104be30c71cc8f407087d7aa0c44",
      explanation: "Add your explanation here...",
    },
    {
      id: "5",
      title: "Prototype",
      artist: "Outkast",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0215b62abc4b14254c4ad8621d",
      spotifyUrl: "https://open.spotify.com/track/476BGkZCAmmpw36sI4c5dt",
      previewUrl: "https://p.scdn.co/mp3-preview/b41ec3484604439aac401256142545c35040b02f",
      explanation: "Add your explanation here...",
    },
    {
      id: "6",
      title: "Everything Happens To Me",
      artist: "Mr Hudson",
      albumArt: "https://i.scdn.co/image/ab67616d00001e028d0512ca6aca9d4fa6df317a",
      spotifyUrl: "https://open.spotify.com/track/1RraFTMSBiEbDjS3bX7FP6",
      previewUrl: "https://p.scdn.co/mp3-preview/a16b917f869ed5dc07cecc450d2d80867af436f4",
      explanation: "Add your explanation here...",
    },
    {
      id: "7",
      title: "Blame It On The Sun",
      artist: "Stevie Wonder",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02a14b08b9a6616e121df5e8b0",
      spotifyUrl: "https://open.spotify.com/track/65qWooYTj0dq5HzoV6P9Kt",
      previewUrl: "https://p.scdn.co/mp3-preview/7043ac22cacaca658828da1b9068e05bd0fb2e57",
      explanation: "Add your explanation here...",
    },
    {
      id: "8",
      title: "I Know It's Over",
      artist: "The Smiths",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02ada101c2e9e97feb8fae37a9",
      spotifyUrl: "https://open.spotify.com/track/3M2bD9SMYnJIPdrTKUnBd3",
      previewUrl: "https://p.scdn.co/mp3-preview/03d2a368be26cf839f3acc7258ab6b25eef81b94",
      explanation: "Add your explanation here...",
    },
    {
      id: "9",
      title: "I Fall In Love Too Easily",
      artist: "Chet Baker",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02309ae95ef92cb8b068e7ce52",
      spotifyUrl: "https://open.spotify.com/track/0F845nujLVqCb0XMZCh5Pc",
      previewUrl: "https://p.scdn.co/mp3-preview/c91c095210fc630663c4ad2f63a357519fc1c397",
      explanation: "Add your explanation here...",
    },
    {
      id: "10",
      title: "Trouble",
      artist: "Richard Saunders",
      albumArt: "https://i.scdn.co/image/ab67616d00001e020995328b6390f89b3eb2b27e",
      spotifyUrl: "https://open.spotify.com/track/5N7usY5OYD0sCTNiZZlyQn",
      previewUrl: "https://p.scdn.co/mp3-preview/d17f9845dc277c89e3cbb60b76bd2519c5df3038",
      explanation: "Add your explanation here...",
    },
    {
      id: "11",
      title: "What'll I Do?",
      artist: "Nat King Cole Trio",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02fdd261528e3590ac36bb85f0",
      spotifyUrl: "https://open.spotify.com/track/675O3VntvhGApD7h4YQ89G",
      previewUrl: "https://p.scdn.co/mp3-preview/17ca653f58fe74e8464ebebddc0480a9e31d108b",
      explanation: "Add your explanation here...",
    },
    {
      id: "12",
      title: "What Are You Doing The Rest Of Your Life?",
      artist: "Bill Evans",
      albumArt: "https://i.scdn.co/image/ab67616d00001e021fb1655c7ebec963808be2f9",
      spotifyUrl: "https://open.spotify.com/track/1NwwZ1VpCE1vxM28VayW86",
      previewUrl: "https://p.scdn.co/mp3-preview/99505079325ffd3ac4bda8ce3e807e0112a0208d",
      explanation: "Add your explanation here...",
    },
    {
      id: "13",
      title: "If It's Magic",
      artist: "Stevie Wonder",
      albumArt: "https://i.scdn.co/image/ab67616d00001e022fee61bfec596bb6f5447c50",
      spotifyUrl: "https://open.spotify.com/track/4UBzGxrKBZN0NwJ8vTz8AG",
      previewUrl: "https://p.scdn.co/mp3-preview/09f3130d79645a4bbbb6b805fc71abd9e8356233",
      explanation: "Add your explanation here...",
    },
    {
      id: "14",
      title: "Is This Love",
      artist: "Corinne Bailey Rae",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02e99107cbf556089592b73b50",
      spotifyUrl: "https://open.spotify.com/track/5FvapYqWK6TEuh4csYwQ9O",
      previewUrl: "https://p.scdn.co/mp3-preview/f4215af1a270e5173b7bd05faf173b2e6d74940c",
      explanation: "Add your explanation here...",
    },
    {
      id: "15",
      title: "Who Knows",
      artist: "Daniel Caesar",
      albumArt: "https://i.scdn.co/image/ab67616d00001e022bad6e56e77d5bef0aa3f2dc",
      spotifyUrl: "https://open.spotify.com/track/6DH13QYXK7lKkYHSU88N48",
      previewUrl: "https://p.scdn.co/mp3-preview/695ea23e689a1816b09a8ac6f08749f0f5c38420",
      explanation: "Add your explanation here...",
    },
    {
      id: "16",
      title: "True Love Waits",
      artist: "Radiohead",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0205a2f9af5f0eaed4835acf54",
      spotifyUrl: "https://open.spotify.com/track/62SvkbQm1wMS6KZtbtls1V",
      previewUrl: "https://p.scdn.co/mp3-preview/f7fb2f0a7896f669e71f35a6fe7bafdd8e62f7b6",
      explanation: "Add your explanation here...",
    },
    {
      id: "17",
      title: "Calling All My Lovelies",
      artist: "Bruno Mars",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02232711f7d66a1e19e89e28c5",
      spotifyUrl: "https://open.spotify.com/track/6ObpR8ek44tvWefQRcSo8K",
      previewUrl: "https://p.scdn.co/mp3-preview/eb7950f593437250a5ac974e9aca2452f92190ab",
      explanation: "Add your explanation here...",
    },
    {
      id: "18",
      title: "On A Clear Day (You Can See Forever)",
      artist: "Bill Evans",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02e750adc4de4ddcc28854c8dc",
      spotifyUrl: "https://open.spotify.com/track/6yawvMbA9jLmDt6mjeEiNm",
      previewUrl: "https://p.scdn.co/mp3-preview/13ebdcd3a55c1c5bfa68cacc28d5688326fbb08b",
      explanation: "Add your explanation here...",
    },
    {
      id: "19",
      title: "Tell Me Who You Are Today",
      artist: "Beth Gibbons",
      albumArt: "https://i.scdn.co/image/ab67616d00001e0216997b4a53ae6b42a4b803be",
      spotifyUrl: "https://open.spotify.com/track/1tB6SUQaXIUU4CprvNPwsT",
      previewUrl: "https://p.scdn.co/mp3-preview/095044ef5939704652dd2ff881c8287386581d27",
      explanation: "Add your explanation here...",
    },
    {
      id: "20",
      title: "I'm A Fool To Want You",
      artist: "Dexter Gordon",
      albumArt: "https://i.scdn.co/image/ab67616d00001e026d5755072aaf2dad1868b182",
      spotifyUrl: "https://open.spotify.com/track/4EaNQXQIuiBlQe5fe5fae6",
      previewUrl: "https://p.scdn.co/mp3-preview/3d35d8100d0b64ff26c7bbeaa306569e1f5a906e",
      explanation: "Add your explanation here...",
    },
    {
      id: "21",
      title: "I Only Have Eyes for You",
      artist: "The Flamingos",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02c915b018511be9560190b272",
      spotifyUrl: "https://open.spotify.com/track/1jz8TlrPZR6oXROieCoc2v",
      previewUrl: "https://p.scdn.co/mp3-preview/2c4dd05b0475d941124d127d125b30a5b4a872a7",
      explanation: "Add your explanation here...",
    },
    {
      id: "22",
      title: "Media Vuelta",
      artist: "Eydie Gormé, Los Panchos",
      albumArt: "https://i.scdn.co/image/ab67616d00001e021882bb790ff01387342c9750",
      spotifyUrl: "https://open.spotify.com/track/0LVLuqyQrXViI9OzDIVxbw",
      previewUrl: "https://p.scdn.co/mp3-preview/16712a09d202d8e178d3321fb4d44f4575ee7592",
      explanation: "Add your explanation here...",
    },
    {
      id: "23",
      title: "Linger (Acoustic Version)",
      artist: "The Cranberries",
      albumArt: "https://i.scdn.co/image/ab67616d00001e02685628de68cfc204f3f8dbd5",
      spotifyUrl: "https://open.spotify.com/track/1nxebACXgKGhpB2DPs3qP0",
      previewUrl: "https://p.scdn.co/mp3-preview/4e1dac72be8b32eb170eeb984c69e7b7ce95371e",
      explanation: "Add your explanation here...",
    },
    {
      id: "24",
      title: "Time in a Bottle",
      artist: "Jim Croce",
      albumArt: "https://i.scdn.co/image/ab67616d00001e025b7a6cabbcb9fe150966563c",
      spotifyUrl: "https://open.spotify.com/track/7uWFUpGuEfmxYeymkV95jn",
      previewUrl: "https://p.scdn.co/mp3-preview/b5d8d825de94c965b3f20157bbbb3612fceaed47",
      explanation: "Add your explanation here...",
    },
    {
      id: "25",
      title: "Fool Me a Good Night",
      artist: "Labi Siffre",
      albumArt: "https://i.scdn.co/image/ab67616d00001e024f6f29e2eb6055e6451e042e",
      spotifyUrl: "https://open.spotify.com/track/344spUSRUifQy5VSAWw8OI",
      previewUrl: "https://p.scdn.co/mp3-preview/0cf1a59c59f70e0c4bfa14917638fd587f028a4c",
      explanation: "Add your explanation here...",
    },
    {
      id: "26",
      title: "Regrets",
      artist: "JAY-Z",
      albumArt: "https://i.scdn.co/image/ab67616d00001e027a353e74db759af39d3f26b0",
      spotifyUrl: "https://open.spotify.com/track/2G5VfBhThZMgDXHBh6EHah",
      previewUrl: "https://p.scdn.co/mp3-preview/a26f978c24977b34066d706aa0c0cb6e8411e62e",
      explanation: "Add your explanation here...",
    },
    {
      id: "27",
      title: "Do You Ever Think Of Me?",
      artist: "Corinne Bailey Rae",
      albumArt: "https://i.scdn.co/image/ab67616d00001e024a90e81173a3a5ad2e63f1a5",
      spotifyUrl: "https://open.spotify.com/track/4dNcc0IbNYNPTfshVv941Z",
      previewUrl: "https://p.scdn.co/mp3-preview/4ca4dea645a62f01d41b1f256fef50284d81d487",
      explanation: "Add your explanation here...",
    },
  ] as Song[],
};

export function Phone({ isExpanded = false }: PhoneProps) {
  const [hoveredSong, setHoveredSong] = useState<Song | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [failedPreviews, setFailedPreviews] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        {/* Playlist header with cover */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
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
                onMouseLeave={() => setHoveredSong(null)}
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
        className="rounded-xl p-6 flex flex-col justify-center"
        style={{
          backgroundColor: 'var(--color-paper)',
          width: '350px',
          minHeight: '300px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {hoveredSong ? (
          <div className="transition-opacity duration-200">
            <p className="serif text-lg italic mb-3" style={{ color: 'var(--color-ink-faded)' }}>
              "{hoveredSong.title}"
            </p>
            <p className="serif text-base leading-relaxed" style={{ color: 'var(--color-ink)' }}>
              {hoveredSong.explanation}
            </p>
          </div>
        ) : (
          <p className="serif text-xl text-center italic" style={{ color: 'var(--color-ink-faded)' }}>
            hover over a song to see why it's special
          </p>
        )}
      </div>
    </div>
  );
}
