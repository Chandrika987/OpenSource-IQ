import { MapPin, Link as LinkIcon, Calendar, Users, Briefcase } from 'lucide-react';

export default function GitHubProfile({ profile }) {
  if (!profile) return null;

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="glass-panel p-6 border-white/5 relative overflow-hidden group mb-8">
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-primary-500/20 to-accent/20 blur-3xl rounded-full" />
      
      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        <div className="flex-shrink-0">
          <img 
            src={profile.avatar_url} 
            alt={`${profile.login}'s avatar`} 
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-white/10 shadow-xl object-cover"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.name || profile.login}</h2>
              <a 
                href={profile.html_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                @{profile.login}
              </a>
            </div>
          </div>
          
          {profile.bio && (
            <p className="text-gray-300 mt-2 mb-4 max-w-2xl text-sm leading-relaxed">
              {profile.bio}
            </p>
          )}
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-4">
            {profile.company && (
              <div className="flex items-center gap-1.5">
                <Briefcase size={16} />
                <span>{profile.company}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.blog && (
              <div className="flex items-center gap-1.5">
                <LinkIcon size={16} />
                <a href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  {profile.blog}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>Joined {joinedDate}</span>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-gray-400" />
              <span className="font-semibold text-white">{profile.followers}</span>
              <span className="text-gray-400">followers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">{profile.following}</span>
              <span className="text-gray-400">following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
