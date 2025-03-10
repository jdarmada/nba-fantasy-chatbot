'use client';

import { useState } from 'react';
import { comparePlayersForFantasy } from '../actions';
import { FaBasketballBall } from 'react-icons/fa';

export function FantasyComparison() {
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const query = formData.get('query') as string;

        if (!query) {
            setError('Please enter a comparison query');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await comparePlayersForFantasy(query);

            if (response.content) {
                setResult(response.content);
            } else {
                setError('No comparison data available');
            }
        } catch (err) {
            console.error('handleSubmit error:', err);
            setError(
                'Failed to compare players: ' +
                    (err instanceof Error ? err.message : String(err))
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">
                WojBot: Fantasy Basketball Comparison
            </h1>

            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex items-center gap-4">
                    <label className="font-medium">
                        Compare Players:
                        <input
                            name="query"
                            placeholder="Input two players you want to compare"
                            className="w-full px-4 py-2 border rounded mt-1"
                            required
                        />
                    </label>
                    <div className='pt-6'>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-12 h-12 align-bottom rounded-full bg-orange-500 flex justify-center items-center text-white hover:bg-orange-400 disabled:opacity-50"
                        >
                            <FaBasketballBall className='text-4xl'/>
                        </button>
                    </div>
                        <small className='text-gray-400 pt-6'>Press ball to submit</small>
                </div>
            </form>

            {loading && (
                <div className="animate-pulse mt-4 p-6 border rounded bg-blue-50">
                    <p className="text-center text-orange-500">
                        WojBot is thinking...
                    </p>
                </div>
            )}

            {error && (
                <div>
                    <p>{error}</p>
                </div>
            )}

            {result && !error && (
                <div className="mt-4 p-6 border rounded text-white">
                    <h2 className="text-xl font-semibold mb-4">
                        Comparison Results
                    </h2>
                    <div className="whitespace-pre-wrap">{result}</div>
                </div>
            )}

            <div className="mt-6 text-sm text-gray-500">
                <p>Example queries:</p>
                <ul className="list-disc pl-5 mt-2">
                    <li>
                        Who is better to pick up, LeBron James or Russell
                        Westbrook?
                    </li>
                    <li>
                        Compare Stephen Curry and Luka Doncic for my fantasy
                        team
                    </li>
                    <li>Should I add Jayson Tatum or Joel Embiid?</li>
                </ul>
            </div>
        </div>
    );
}
