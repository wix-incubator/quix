import React, { useEffect, useState } from 'react';
import { Subtract } from 'utility-types';

interface InjectedPaginationProps {
  data: any[];
  columns: any[];
  onRowClicked(rows: any): void;
  getChunk(): void;
  isChunking: boolean;
}

interface MakePaginationProps {
  data: any[];
  columns: any[];
  onRowClicked(rows: any): void;
  loadMore(offset: number, limit: number): void;
  paginationSize: number;
  tableSize?(size: number): void;
}

const makePagination = <P extends InjectedPaginationProps>(
    Component: React.ComponentType<P>,
  ) =>  {
    const MakePagination: React.FC<
    Subtract<P, InjectedPaginationProps> & MakePaginationProps>
    = (props: MakePaginationProps) => {

      const [isChunking, setIsChunking] = useState(false);
      const [requestCount, setRequestCount] = useState(0);
      const [fixedData, setFixedData] = useState([]);
      const { data, columns, onRowClicked, loadMore, paginationSize, tableSize } = props;


      useEffect(() => {
        setIsChunking(false);
        setRequestCount(requestCount + 1);
        if (fixedData.length === data.length - 1) {
          setFixedData(data);
        }else {
          setFixedData(data.slice(0, data.length - 1));
        }
      }, [data]);

      useEffect(() => {
        if (tableSize) { tableSize(fixedData.length) }
      }, [fixedData.length]);


      const getChunk = () => {
        const resultsLeft = data.length % paginationSize === 1 && data.length !== fixedData.length;
        if (!isChunking && resultsLeft) {
          setIsChunking(true);
          loadMore(paginationSize * requestCount, paginationSize);
        }
      }

      const componentProps = {
        columns,
        data: fixedData,
        isChunking,
        onRowClicked,
        getChunk,
      };
      return <Component {...componentProps as P} />
    }
    return MakePagination;
    }

export default makePagination;