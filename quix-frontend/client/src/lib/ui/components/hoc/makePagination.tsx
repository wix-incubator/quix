import React, { useEffect, useState } from 'react';
import { Subtract } from 'utility-types';
import _ from 'lodash';

interface InjectedPaginationProps {
  data: any[];
  columns: any[];
  getChunk?(): void;
  isChunking?: boolean;
}

interface MakePaginationProps {
  initialData: any;
  columns: any[];
  loadMore(offset: number, limit: number): any;
  paginationSize: number;
  tableSize?(size: number): void;
  getChunk?(): void;
}

const makePagination = <P extends InjectedPaginationProps>(
    Component: React.ComponentType<P>,
  ) =>  {
    const MakePagination = (props: Subtract<P, InjectedPaginationProps> & MakePaginationProps) => {

      const { initialData, columns, loadMore, paginationSize, tableSize, ...restComponentProps } = props;

      const [isChunking, setIsChunking] = useState(false);
      const [resultsLeft, setResultsLeft] = useState(initialData && initialData.length === paginationSize + 1);
      const [data, setData] = useState(resultsLeft ? initialData.slice(0, paginationSize) : (initialData || []));
 
      useEffect(() => {
        if (tableSize) {
          tableSize(data.length);
        }
      }, [data.length]);

      const getChunk = () => {
        if (!isChunking && resultsLeft) {
          setIsChunking(true);

          loadMore(data.length, paginationSize + 1)(response => {
              if (response.length === paginationSize + 1) {
                setData([...data, ...response.slice(0, paginationSize)]);
              } else {
                setResultsLeft(false);
                setData([...data, ...response]);
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
        ...restComponentProps,
      };
      return <Component {...componentProps as any} />
    }
    return MakePagination;
    }

export default makePagination;