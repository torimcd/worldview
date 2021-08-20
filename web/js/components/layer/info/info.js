import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { dateOverlap } from '../../../modules/layers/util';
import DateRanges from './date-ranges';
import util from '../../../util/util';

function configureTemporalDate(dateType, date, period) {
  return util.coverageDateFormatter(dateType, date, period);
}

export default function LayerInfo ({ layer, measurementDescriptionPath }) {
  const {
    dateRanges,
    endDate,
    id,
    period,
    startDate,
  } = layer;

  const [layerMetadata, setLayerMetadata] = useState();
  const [measurementMetadata, setMeasurementMetadata] = useState();

  const initMetadata = async () => {
    if (!measurementMetadata && measurementDescriptionPath) {
      const url = `config/metadata/layers/${measurementDescriptionPath}.html`;
      const data = await util.get(url);
      setMeasurementMetadata(data);
    }
  };
  useEffect(() => {
    initMetadata();
  }, [layer]);

  useEffect(() => {
    let controller = new AbortController();
    (async () => {
      if (!layer.description) return;
      try {
        const options = { signal: controller.signal };
        const data = await fetch(`config/metadata/layers/${layer.description}.html`, options);
        const metadataHtml = await data.text();
        controller = null;
        setLayerMetadata(metadataHtml || 'No description was found for this layer.');
      } catch (e) {
        if (!controller.signal.aborted) {
          console.error(e);
        }
      }
    })();
    return () => (controller ? controller.abort() : null);
  }, [layer]);

  const getDateOverlapDateRanges = () => {
    const hasLayerDateRange = dateRanges && dateRanges.length > 1;
    const overlapDateRanges = hasLayerDateRange
      ? dateOverlap(period, dateRanges)
      : [];
    return hasLayerDateRange && overlapDateRanges.overlap === false;
  };

  const needDateRanges = getDateOverlapDateRanges();

  return (
    <div id="layer-description" className="layer-description">
      {startDate || endDate ? (
        <div id="layer-date-range" className="layer-date-range">
          <span id={`${id}-startDate`} className="layer-date-start">
            {startDate
              ? `Temporal coverage: ${
                configureTemporalDate('START-DATE', startDate, period)}`
              : ''}
          </span>
          <span id={`${id}-endDate`} className="layer-date-end">
            {startDate && endDate
              ? ` - ${
                configureTemporalDate('END-DATE', endDate, period)}`
              : startDate
                ? ' - Present'
                : ''}
          </span>
          {needDateRanges
              && <DateRanges layer={layer} />}
        </div>
      )
        : ''}
      {layerMetadata ? (
        <div
          id="layer-metadata"
          className="layer-metadata"
          dangerouslySetInnerHTML={{ __html: layerMetadata }}
        />
      ) : (
        <div id="layer-metadata" className="layer-metadata">
          <p>Loading MetaData...</p>
        </div>
      )}

      {measurementMetadata && (
        <div
          className="source-metadata"
          dangerouslySetInnerHTML={{ __html: measurementMetadata }}
        />
      )}
    </div>
  );
}

LayerInfo.propTypes = {
  layer: PropTypes.object,
  measurementDescriptionPath: PropTypes.string,
};
