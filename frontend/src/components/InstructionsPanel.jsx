const InstructionsPanel = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      zIndex: 999,
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>Użycie grafu:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
          <li>naciśnij na węzeł żeby wyświetlić szczegóły</li>
          <li>powiększ i pomniejsz za pomocą scroll'a myszki</li>
          <li>przeciągnij żeby przesunąć węzły</li>
        </ul>
      </div>

      <div>
        <strong>Reguły krawędzi:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px', fontSize: '11px' }}>
          <li>artysta → wydał → album</li>
          <li>artysta → wydał → piosenkę</li>
          <li>album → zawiera → piosenkę</li>
        </ul>
      </div>
    </div>
  );
};

export default InstructionsPanel;