import useChartsReady from '../../hooks/useChartsReady'

export default function ChartMount({ children, height = 200, className = '' }) {
  const ready = useChartsReady()
  return (
    <div className={className} style={height ? { height } : undefined}>
      {ready ? children : null}
    </div>
  )
}