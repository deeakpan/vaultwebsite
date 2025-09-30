'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Token {
  id: string;
  name: string;
  address: string;
  link: string;
  created_at: string;
}

interface VoteData {
  votes: Array<{
    id: string;
    address: string;
    name: string;
    created_at: string;
  }>;
  voteCounts: { [key: string]: number };
}

export default function VoteComponent() {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [voteData, setVoteData] = useState<VoteData>({ votes: [], voteCounts: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userVote, setUserVote] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
    fetchVotes();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      checkUserVote();
    }
  }, [isConnected, address, voteData.votes]);

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/tokens');
      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens || []);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const fetchVotes = async () => {
    try {
      const response = await fetch('/api/votes');
      if (response.ok) {
        const data = await response.json();
        setVoteData(data);
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const checkUserVote = () => {
    if (!address) return;
    
    const userVoteRecord = voteData.votes.find(vote => 
      vote.address.toLowerCase() === address.toLowerCase()
    );
    
    setUserVote(userVoteRecord ? userVoteRecord.name : null);
  };

  const handleVote = async (tokenName: string) => {
    if (!isConnected || !address) {
      setMessage('Please connect your wallet to vote');
      return;
    }

    if (userVote) {
      setMessage('You have already voted');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address,
          tokenName: tokenName
        }),
      });

      if (response.ok) {
        setMessage('Vote submitted successfully!');
        setUserVote(tokenName);
        fetchVotes();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to submit vote');
      }
    } catch (error) {
      setMessage('Error submitting vote');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVoteCount = (tokenName: string) => {
    return voteData.voteCounts[tokenName] || 0;
  };

  const getTotalVotes = () => {
    return Object.values(voteData.voteCounts).reduce((sum, count) => sum + count, 0);
  };

  const getVotePercentage = (tokenName: string) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return ((getVoteCount(tokenName) / total) * 100).toFixed(1);
  };

  const getLeadingToken = () => {
    if (Object.keys(voteData.voteCounts).length === 0) return null;
    
    return Object.entries(voteData.voteCounts).reduce((a, b) => 
      voteData.voteCounts[a[0]] > voteData.voteCounts[b[0]] ? a : b
    );
  };

  const leadingToken = getLeadingToken();
  const sortedTokens = [...tokens].sort((a, b) => getVoteCount(b.name) - getVoteCount(a.name));

  if (tokens.length === 0) {
    return (
      <section id="vote" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pepu-yellow-orange to-pepu-light-green bg-clip-text text-transparent">
            Token Voting
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            No tokens available for voting yet
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="vote" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pepu-yellow-orange to-pepu-light-green bg-clip-text text-transparent">
            Vote for Treasury Tokens
          </h2>
           <p className="text-base text-gray-600 dark:text-gray-400">
             VAULT holders (1M+ tokens) decide which tokens get treasury support
           </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('Error') || message.includes('already voted') || message.includes('connect')
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50' 
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50'
          }`}>
            {message}
          </div>
        )}

        <div className="flex items-center justify-between mb-8 text-sm">
          <div className="flex items-center gap-4">
            {isConnected && address ? (
              <>
                <span className="text-gray-600 dark:text-gray-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                {userVote && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-green-600 dark:text-green-400">
                      Voted for {userVote}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">Connect wallet to vote</span>
            )}
          </div>
          {leadingToken && (
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-pepu-yellow-orange">{leadingToken[0]}</span> leads with {leadingToken[1]} votes
            </span>
          )}
        </div>

        <div className="space-y-3">
          {sortedTokens.map((token, index) => {
            const voteCount = getVoteCount(token.name);
            const percentage = getVotePercentage(token.name);
            const isLeading = leadingToken && leadingToken[0] === token.name;
            const hasUserVoted = userVote === token.name;
            
            return (
              <div 
                key={token.id}
                className={`relative overflow-hidden rounded-xl border transition-all ${
                  isLeading 
                    ? 'bg-gradient-to-r from-yellow-50 to-green-50 dark:from-yellow-950/20 dark:to-green-950/20 border-pepu-yellow-orange/40 dark:border-pepu-yellow-orange/30' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                } hover:border-pepu-yellow-orange/50 dark:hover:border-pepu-yellow-orange/40`}
              >
                <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-pepu-yellow-orange/15 to-pepu-light-green/15 dark:from-pepu-yellow-orange/10 dark:to-pepu-light-green/10 transition-all"
                     style={{ width: `${percentage}%` }} />
                
                <div className="relative p-5">
                  <div className="flex items-center gap-5 mb-3">
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold text-pepu-yellow-orange">
                        {voteCount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {token.name}
                        </h3>
                        {index === 0 && isLeading && (
                          <span className="px-2 py-0.5 bg-pepu-yellow-orange/20 text-pepu-yellow-orange text-xs font-semibold rounded">
                            Leading
                          </span>
                        )}
                        {hasUserVoted && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded">
                            Your Vote
                          </span>
                        )}
                      </div>
                       <p className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                         {token.address}
                       </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a 
                        href={token.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Chart
                      </a>
                      
                      <button
                        onClick={() => handleVote(token.name)}
                        disabled={isLoading || !isConnected || userVote !== null}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                          hasUserVoted
                            ? 'bg-green-500 text-white'
                            : !isConnected || userVote !== null
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-pepu-yellow-orange to-pepu-light-green text-gray-900 hover:shadow-lg'
                        }`}
                      >
                        {hasUserVoted ? 'Voted' : !isConnected ? 'Connect' : isLoading ? '...' : 'Vote'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

         <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
           One vote per wallet • 1M+ VAULT holders only • {getTotalVotes()} total votes cast
         </div>
      </div>
    </section>
  );
}