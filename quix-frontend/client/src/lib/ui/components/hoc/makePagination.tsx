import React, { useEffect, useState, useRef } from 'react';
import { Subtract } from 'utility-types';
import _ from 'lodash';

interface InjectedPaginationProps {
  data: any[];
  columns: any[];
  getChunk(): void;
  isChunking: boolean;
}

interface MakePaginationProps {
  columns: any[];
  loadMore({offset, limit, rest}: {offset: number; limit: number; rest: object}): Promise<any[]>;
  paginationSize: number;
  tableSize?(size: number): void;
  filter?: any;
  getChunk?(): void;
}

const makePagination = <P extends InjectedPaginationProps>(
    Component: React.ComponentType<P>,
  ) =>  {
    const MakePagination: React.FC<
    Subtract<P, InjectedPaginationProps> & MakePaginationProps>
    = (props: MakePaginationProps) => {

      const [isChunking, setIsChunking] = useState(false);
      const [data, setData] = useState([]);
      const [resultsLeft, setResultsLeft] = useState(true);
      const [prevFilter, setPrevFilter] = useState({});
 
      const { columns, filter, loadMore, paginationSize, tableSize, ...rest } = props;

      useEffect(() => {
        const isFilterChanged = !_.isEqual(prevFilter, filter);
        if (isFilterChanged) {
          getChunk(true);
          setPrevFilter(filter);
        }
      }, [filter]);

      
      const isFirstRun = useRef(true);
      useEffect(() => {
        if (isFirstRun.current) {
          isFirstRun.current = false;
          return;
        }
        if (tableSize) {
          tableSize(data.length);
        }
      }, [data.length]);

      const getChunk = (isFilterChanged?: boolean) => {
        if (!isChunking && (resultsLeft || isFilterChanged)) {
          setIsChunking(true);

          let dataLength, currentData;
          if (isFilterChanged) {
            isFirstRun.current = true;
            setData([]);
            dataLength = 0;
            currentData = [];
          } else {
            dataLength = data.length;
            currentData = data;
          }
          
          loadMore({offset: dataLength, limit: paginationSize + 1, rest: filter})
            .then(response => {
              if (response.length === paginationSize + 1) {
                setData([...currentData, ...response.slice(0, paginationSize)]);
              } else {
                setResultsLeft(false);
                setData([...currentData, ...response]);
              }
              setIsChunking(false);
            });
        }
      }

      const componentProps = {
        columns,
        data,
        isChunking,
        getChunk,
        ...rest,
      };
      return <Component {...componentProps as P} />
    }
    return MakePagination;
    }

export default makePagination;