import React, { useEffect, useState } from 'react';
import { Subtract } from 'utility-types';

interface InjectedPaginationProps {
  data: any[];
  columns: any[];
  getChunk(): void;
  isChunking: boolean;
}

interface MakePaginationProps {
  columns: any[];
  loadMore(offset: number, limit: number, filter: any): Promise<any[]>;
  paginationSize: number;
  tableSize?(size: number): void;
  defaultFilter?: string;
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
      const [filter, setFilter] = useState('');

      const { columns, loadMore, paginationSize, tableSize, ...rest } = props;

      useEffect(() => {
        if (tableSize) {
          tableSize(data.length);
        }
      }, [data.length]);

      const getChunk = (currentFilter?: any) => {
        const isFilterChanged = filter !== currentFilter;
        if (!isChunking && (resultsLeft || isFilterChanged)) {
          setIsChunking(true);

          let dataLength, currentData;
          if (isFilterChanged) {
            setData([]);
            setFilter(currentFilter);
            dataLength = 0;
            currentData = [];
          } else {
            dataLength = data.length;
            currentData = data;
          }
          
          loadMore(dataLength, paginationSize + 1, currentFilter)
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