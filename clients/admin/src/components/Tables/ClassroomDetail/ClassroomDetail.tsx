import { SearchOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Highlighter from 'react-highlight-words';
import { Button, Input, Popconfirm, Space, Table, InputRef, Typography, Tag, message, InputNumber, Form} from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import axios from "axios";

interface DataType {
  _id: string;
  studentID?: string;
  username: string;
  email: string;
  role: string;
}

type DataIndex = keyof DataType;


interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  // dataIndex: string;
  dataIndex: keyof DataType;
  title: any;
  inputType: 'number' | 'text';
  record: DataType;
  index: number;
  children: React.ReactNode;
  dataSource: DataType[]; // Thêm dataSource vào props
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  dataSource, 
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input allowClear/>;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules = {
          [
            {
              validator: async (_, value) => {
                // Kiểm tra nếu dữ liệu đã tồn tại
                if (value && dataSource.some(item =>  {
                  return item[dataIndex] === value
                })) {
                  throw new Error(`${title.split(" ")[1]} already exists!`);
                }
              },
            },
          ]
          }
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const ClassroomDetailTable: React.FC = () => {
  const {slug} = useParams();
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [classTitle, setClassTitle] = useState<any>({
    cid: '',
    name: '',
  })
 
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string>('');
  const isEditing = (record: DataType) => record._id === editingKey;

  const edit = (record: Partial<DataType> & { key: React.Key }) => {
    form.setFieldsValue({ id: '',studentID: '', username: '', email: '',role: '', ...record });
    setEditingKey(record._id as string) ;
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    setIsTableLoading(true);
    try {
      const row = (await form.validateFields()) as DataType;
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item._id);
      if (index > -1) { // update data
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setDataSource(newData);
        setEditingKey('');
        // call api to get response
        try {
          const response = await axios.patch(`${process.env.REACT_APP_BACKEND_HOST}/v1/classroom/${slug}/student/${key}`, {
            student_id: row.studentID,
          });
          if (response.status === 200) {
            setTimeout(() => {
              setIsTableLoading(false);
              message.success({
                content: 'New Student ID assigned to this user successfully!',
                style: {
                  fontFamily: 'Montserrat',
                  fontSize: 16,
                }
              });
              setDataSource(response.data.detailedClassroom.map((user: any) => {
                return {
                  ...user,
                  studentID: user.studentID ? user.studentID : '-'
                }
              }));
            }, 1500);
          }
          else message.error({
            content: response.data.message,
          })
        } catch (err) {
          console.log('err: ', err);
          message.error({
            content: 'Unexpected errors!'
          })
        }
      } else { // add new data
        newData.push(row);
        setDataSource(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_HOST}/v1/classroom/${slug}`).then((response) => {
      if (response.status === 200) {
        setTimeout(() => { 
          setIsTableLoading(false);
          if (response.data.detailedClassroom.length === 0) {
            message.info({
              content: 'No students found!',
              style: {
                fontFamily: 'Montserrat',
                fontSize: 16,
              },
              duration: 1.2,
            })
            return;
          }
          message.success({
            content: 'Data was loaded successfully!',
            style: {
              fontFamily: 'Montserrat',
              fontSize: 16,
            },
            duration: 1.2,
          });
        setClassTitle({
          cid: response.data.cid,
          name: response.data.name,
        })
        setDataSource(response.data.detailedClassroom.map((user: any) => {
          return {
            ...user,
            studentID: user.studentID ? user.studentID : '-'
          }
        }));
        }, 800); 
       
      }
    }).catch((error: Response) => console.log('err:', error));
  }, [])

  // search item in column
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  // reset search text
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  // handle searching for columns
  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            className = "!flex !justify-center !items-center !gap-0"
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            className= "!flex !justify-center !items-center"
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90}}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
           Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined className = {filtered ? "!text-primary" : ''}/>
    ),
    onFilter: (value, record) => 
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase())??false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // Delete a row (new data item)
  const handleActionDelete = async (key: React.Key) => {
    setIsTableLoading(true);
    try {
      const response = await axios.delete(`${process.env.REACT_APP_BACKEND_HOST}/v1/classroom/${slug}/student/${key}`);
      if (response.status === 200) {
        setTimeout(() => {
          setIsTableLoading(false);
          message.success({
            content: 'This account was deleted successfully!',
            style: {
              fontFamily: 'Montserrat',
              fontSize: 16,
            }
          });
          setDataSource(response.data.detailedClassroom.map((user: any) => {
            return {
              ...user,
              studentID: user.studentID ? user.studentID : '-'
            }
          }));
        }, 1500);
      }
      else message.error({
        content: response.data.message,
      })
    } catch (err) {
      console.log('err: ', err);
      message.error({
        content: 'Unexpected errors!'
      })
    }
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'studentID',
      key: 'studentID',
      ellipsis: true,
      editable: true,
      ...getColumnSearchProps('studentID'),
      onCell: (record: DataType) => ({
          record,
          editable: true,
          dataIndex: 'username',
          title: 'Username',
        }),
      className: "!text-md",

    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      editable: false,
      ...getColumnSearchProps('username'),
      className: "!text-md",
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '30%',
      ellipsis: true,
      editable: false,
      ...getColumnSearchProps('email'),
      className: "!text-md",
    },
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        width: '12%',
        editable: false,
        filters: [
          { text: 'Student', value: 'student' },
          { text: 'Lecturer', value: 'lecturer' },
        ],
        onFilter: (value: any, record: DataType) => {
          if (value === "student") return record.role === 'student';
          else if (value === "lecturer") return record.role === 'lecturer';
          return true;
        },
        // customize cell content
        render: (_: any, record: DataType) => {
            return (
                <Tag color= {record.role === "student" ? "green" : "blue" } style = {{
                fontSize: 16,
                minWidth: 80,
                textAlign: 'center',
                padding: 4,
              }}>
                {record.role === "student" ? "Student" : "Lecturer"}
              </Tag>
            );
        }
    },
    {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        width: "21%",
        render: (_: any, record: DataType) => {
          const editable = isEditing(record);
          return editable ? (
            <Space size = "middle">
              <Button type = "primary" onClick={() => save(record._id)} style={{width: '80px'}}>
                Save
              </Button>
              <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                  <Button style={{width: '80px'}} className = "!flex !justify-center !items-center">Cancel</Button>
              </Popconfirm>
            </Space>
          ) : (
            <Space size="middle">
              <Button
                disabled = {record.role === 'lecturer' ? true : false}
                style={{
                  width: '80px'
                }}
                className={record.role === 'student' ? `!bg-orange-500 !hover:bg-orange-700 !border-transparent !text-white !flex !justify-center !items-center` : ''}
                onClick={() => edit(record as any)}>         
                Edit
              </Button>
              {dataSource.length >= 1 ? (
                <Popconfirm title="Sure to delete?" onConfirm={() => handleActionDelete(record._id)}>
                <Button disabled = {record.role === 'lecturer' ? true : false} type = "primary"  danger style = {{
                  width: '80px'
                }} className = "!flex !justify-center !items-center">Delete</Button>
                </Popconfirm>
              ) : null}
            </Space>
          );
        },
    },
  ];

  const mergedColumns: any = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        dataSource, // truyền dataSource xuống EditableCell
      }),
    };
  });

  return <div>
    <Typography.Title level={3} style={{ margin: 0, color: "#00A551" }} className='!uppercase !mt-4 !mb-4'>
      {classTitle.cid !== '' ?  `${classTitle.cid} - ${classTitle.name}`: 'Classroom Detail Management'}
    </Typography.Title>
    <Form form={form} component={false}>
      <Table 
        className = "myTable"
        bordered = {true}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        dataSource={dataSource} 
        columns = {mergedColumns}
        rowClassName="editable-row"
        loading = {isTableLoading}
        pagination={{
        total: dataSource.length,
        pageSize: 7,
        showSizeChanger: false, // Turn off feature to change page size
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}/>
    </Form>
   
  </div>
};

export default ClassroomDetailTable;
