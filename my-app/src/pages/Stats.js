import { HeaderSimple } from '../components/Header';
import { Sparkline } from '@mantine/charts'; 
import { IconDisc } from '@tabler/icons-react'
import './Stats.css'

const Stats = () => {
    //plan first it will check if it returns something, if nothing is returned, tell the user to login to see their high scores and stats and fun stuff
    //if it does return something, it will show the stats

    //there are two user flows for this page: if user is not log in, add a button prompting the user to login
    //other wise it should look something like this
    //cc's Stats
    //easy
    //medium
    //hard
    // on the right can be a portrait of taylor or smth


    return (
        <div className="stats-container">
            <HeaderSimple />
            <h1>cc's Longest Streaks</h1>

            <div className="outer-container">
                {/* Row container with two columns */}
                <div className="row">
                    {/* First column containing Taylor Swift's portrait */}
                    <div className="column image-column">
                        <div className="microphone-icon">
                            <IconDisc size={48} /> {/* Icon size can be adjusted here */}
                        </div>
                        <p className="artist-name">Artist: Taylor Swift</p>
                    </div>

                    {/* Second column containing the chart, takes up 80% width */}
                    <div className="column chart-column">
                        <Sparkline
                            w={450}
                            h={100}
                            data={[10, 20, 40, 20, 40, 10, 50, 60, 70, 100]} // Sample data
                            curveType="linear"
                            color="purple"
                            fillOpacity={0.8}
                            strokeWidth={2}
                        />
                    </div>
                </div>

                {/* Streak content below the row */}
                <div className="card-content-stats">
                    <div className="streak-item">
                    <div className="text-content">
                        <p className="streak-value">0</p> {/* Score comes first */}
                        <h3 className="streak-heading">Easy Mode</h3> {/* Difficulty name comes second */}
                    </div>
                    </div>

                    <div className="streak-item">
                    <div className="text-content">
                        <p className="streak-value">0</p> {/* Score comes first */}
                        <h3 className="streak-heading">Medium Mode</h3> {/* Difficulty name comes second */}
                    </div>
                    </div>

                    <div className="streak-item">
                    <div className="text-content">
                        <p className="streak-value">0</p> {/* Score comes first */}
                        <h3 className="streak-heading">Hard Mode</h3> {/* Difficulty name comes second */}
                    </div>
                    </div>
                </div>
                </div>
        </div>
    );
}

export default Stats;