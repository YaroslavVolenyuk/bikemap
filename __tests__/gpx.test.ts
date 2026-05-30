import { describe, expect, it } from '@jest/globals';
import { buildGpxString } from '../util/gpx';

describe('buildGpxString', () => {
  it('produces valid XML with correct trkpt coordinates and elevation', () => {
    const gpx = buildGpxString(
      'Berlin Loop',
      [
        [13.404954, 52.520008],
        [13.41, 52.53],
      ],
      [
        { distanceMeters: 0, elevationMeters: 35.5 },
        { distanceMeters: 900, elevationMeters: 42.0 },
      ],
    );

    expect(gpx).toMatch(/^<\?xml version="1\.0"/);
    expect(gpx).toContain('<gpx');
    expect(gpx).toContain('lat="52.520008" lon="13.404954"');
    expect(gpx).toContain('<ele>35.5</ele>');
    expect(gpx).toContain('<ele>42.0</ele>');
  });

  it('strips < > & " from route name to prevent XML injection', () => {
    const gpx = buildGpxString('<xss>alert&"1"</xss>', [], []);
    expect(gpx).not.toContain('<xss>');
    expect(gpx).not.toContain('&');
    expect(gpx).toContain('xssalert1/xss');
  });
});
