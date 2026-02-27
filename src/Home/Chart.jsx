import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const Chart = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('bar');

  // Sample data fallback
  const parseSampleData = () => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{ data: [65, 59, 80, 81, 56] }],
    };
  };

  const parseSamplePieData = () => {
    return [
      { name: 'A', population: 35, color: '#6366f1', legendFontColor: '#fff', legendFontSize: 14 },
      { name: 'B', population: 28, color: '#ef4444', legendFontColor: '#fff', legendFontSize: 14 },
      { name: 'C', population: 22, color: '#f59e0b', legendFontColor: '#fff', legendFontSize: 14 },
      { name: 'D', population: 15, color: '#10b981', legendFontColor: '#fff', legendFontSize: 14 },
    ];
  };

  // Parse data to bar chart format with better visibility
  const parseToBarChart = (data) => {
    try {
      if (Array.isArray(data)) {
        const items = data.slice(0, 6);
        
        const labels = items.map((item, idx) => {
          const label = item.name || item.country || item.title || item.category || 
                       item.month || item.date || item.label || item.symbol || 
                       item.id || `Item${idx + 1}`;
          return String(label).substring(0, 5); // Shorter for better fit
        });
        
        const values = items.map(item => {
          const value = item.cases || item.population || item.market_cap || 
                       item.current_price || item.value || item.price || 
                       item.sales || item.count || item.total || item.amount || 
                       item.score || 0;
          
          // Handle nested values
          const finalValue = typeof value === 'number' ? value : parseFloat(value) || 0;
          return Math.abs(finalValue);
        });

        // Normalize large numbers for better visualization
        const maxValue = Math.max(...values);
        let normalizedValues = values;
        let suffix = '';

        if (maxValue > 1000000000) {
          normalizedValues = values.map(v => Math.round(v / 1000000000));
          suffix = 'B';
        } else if (maxValue > 1000000) {
          normalizedValues = values.map(v => Math.round(v / 1000000));
          suffix = 'M';
        } else if (maxValue > 1000) {
          normalizedValues = values.map(v => Math.round(v / 1000));
          suffix = 'K';
        }

        return {
          labels,
          datasets: [{ 
            data: normalizedValues.length > 0 ? normalizedValues : [1],
          }],
          suffix,
        };
      }

      if (typeof data === 'object' && !Array.isArray(data)) {
        const entries = Object.entries(data).slice(0, 6);
        const values = entries.map(([, val]) => Math.abs(parseFloat(val)) || 0);
        const maxValue = Math.max(...values);
        
        let normalizedValues = values;
        let suffix = '';
        
        if (maxValue > 1000000) {
          normalizedValues = values.map(v => Math.round(v / 1000000));
          suffix = 'M';
        } else if (maxValue > 1000) {
          normalizedValues = values.map(v => Math.round(v / 1000));
          suffix = 'K';
        }

        return {
          labels: entries.map(([key]) => String(key).substring(0, 5)),
          datasets: [{ data: normalizedValues }],
          suffix,
        };
      }

      return { ...parseSampleData(), suffix: '' };
    } catch (error) {
      console.error('Bar chart parsing error:', error);
      return { ...parseSampleData(), suffix: '' };
    }
  };

  // Parse data to pie chart format with better visibility
  const parseToPieChart = (data) => {
    const colors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

    try {
      if (Array.isArray(data)) {
        const items = data.slice(0, 6);
        return items.map((item, idx) => {
          const name = item.name || item.country || item.title || item.category || 
                      item.label || item.key || item.symbol || `Item ${idx + 1}`;
          
          const value = item.cases || item.population || item.value || item.count || 
                       item.total || item.amount || item.score || item.current_price || 0;
          
          const finalValue = Math.abs(parseFloat(value)) || 0;
          
          return {
            name: String(name).substring(0, 9),
            population: finalValue,
            color: colors[idx % colors.length],
            legendFontColor: '#fff',
            legendFontSize: 14,
          };
        });
      }

      if (typeof data === 'object') {
        return Object.entries(data).slice(0, 6).map(([key, val], idx) => ({
          name: String(key).substring(0, 9),
          population: Math.abs(parseFloat(val)) || 0,
          color: colors[idx % colors.length],
          legendFontColor: '#fff',
          legendFontSize: 14,
        }));
      }

      return parseSamplePieData();
    } catch (error) {
      console.error('Pie chart parsing error:', error);
      return parseSamplePieData();
    }
  };

  const handleGenerateChart = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(url.trim());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      let parsed;
      if (chartType === 'bar') {
        parsed = parseToBarChart(data);
      } else {
        parsed = parseToPieChart(data);
      }

      setChartData(parsed);
      Alert.alert('Success', 'Chart generated successfully!');
    } catch (error) {
      console.error('Chart generation error:', error);
      Alert.alert(
        'Parse Error',
        'Unable to parse data. Make sure the URL returns valid JSON.',
        [
          { text: 'Try Sample', onPress: fillSampleURL },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const clearChart = () => {
    setChartData(null);
    setUrl('');
  };

  const fillSampleURL = () => {
    const sampleURLs = {
      bar: 'https://disease.sh/v3/covid-19/countries?sort=cases',
      pie: 'https://api.github.com/repos/facebook/react/languages',
    };
    setUrl(sampleURLs[chartType]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Data Visualizer</Text>
        <Text style={styles.subtitle}>Convert JSON URL to charts</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* URL Input */}
        <View style={styles.inputSection}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Enter JSON API URL</Text>
            <Pressable onPress={fillSampleURL}>
              <Text style={styles.sampleBtn}>Sample</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="https://api.example.com/data"
            placeholderTextColor="#475569"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {/* Chart Type */}
        <View style={styles.typeSection}>
          <Text style={styles.label}>Chart Type</Text>
          <View style={styles.typeButtons}>
            <Pressable
              style={[styles.typeBtn, chartType === 'bar' && styles.typeBtnActive]}
              onPress={() => setChartType('bar')}
            >
              <Text style={[styles.typeBtnText, chartType === 'bar' && styles.typeBtnTextActive]}>
                Bar Chart
              </Text>
            </Pressable>

            <Pressable
              style={[styles.typeBtn, chartType === 'pie' && styles.typeBtnActive]}
              onPress={() => setChartType('pie')}
            >
              <Text style={[styles.typeBtnText, chartType === 'pie' && styles.typeBtnTextActive]}>
                Pie Chart
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Generate Button */}
        <Pressable
          style={[styles.generateBtn, loading && { opacity: 0.7 }]}
          onPress={handleGenerateChart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.generateBtnText}>Generate Chart</Text>
          )}
        </Pressable>

        {/* Chart Display */}
        {chartData && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                {chartType === 'bar' ? 'Bar Chart' : 'Pie Chart'}
              </Text>
              <Pressable style={styles.clearBtn} onPress={clearChart}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </Pressable>
            </View>

            {chartType === 'bar' ? (
              <BarChart
                data={{
                  labels: chartData.labels,
                  datasets: chartData.datasets,
                }}
                width={width - 48}
                height={320}
                yAxisLabel=""
                yAxisSuffix={chartData.suffix || ''}
                chartConfig={{
                  backgroundColor: '#1e293b',
                  backgroundGradientFrom: '#1e293b',
                  backgroundGradientTo: '#1e293b',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#334155',
                    strokeWidth: 1,
                  },
                  propsForLabels: {
                    fontSize: 11,
                    fontWeight: 'bold',
                  },
                  propsForVerticalLabels: {
                    fontSize: 10,
                  },
                  barPercentage: 0.7,
                }}
                style={styles.chart}
                showValuesOnTopOfBars
                withInnerLines
                fromZero
              />
            ) : (
              <PieChart
                data={chartData}
                width={width - 48}
                height={260}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="25"
                center={[10, 0]}
                absolute
                hasLegend
                style={styles.chart}
              />
            )}

            {chartData.suffix && (
              <Text style={styles.suffixNote}>
                * Values shown in {chartData.suffix === 'B' ? 'Billions' : chartData.suffix === 'M' ? 'Millions' : 'Thousands'}
              </Text>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}> Data Source</Text>
              <Text style={styles.infoText} numberOfLines={3}>
                {url}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chart;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  header: { padding: 20, paddingTop: 10 },
  backBtn: { marginBottom: 10 },
  backBtnText: { fontSize: 16, color: '#6366f1', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8' },

  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },

  inputSection: { marginBottom: 24 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginLeft: 2 },
  sampleBtn: { fontSize: 13, color: '#6366f1', fontWeight: '700' },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#fff',
  },

  typeSection: { marginBottom: 24 },
  typeButtons: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 16,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  typeBtnText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  typeBtnTextActive: { color: '#fff', fontWeight: '700' },

  generateBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    elevation: 4,
  },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  chartContainer: { marginBottom: 24 },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  clearBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  clearBtnText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },

  chart: { 
    marginVertical: 8, 
    borderRadius: 16,
  },

  suffixNote: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },

  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 8 },
  infoText: { fontSize: 11, color: '#94a3b8', lineHeight: 16 },

  helpSection: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  helpTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  helpText: { fontSize: 14, color: '#cbd5e1', lineHeight: 22 },
  helpBold: { fontWeight: '700', color: '#fff' },
});